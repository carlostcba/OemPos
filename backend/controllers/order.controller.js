// backend/controllers/order.controller.js
const { Order, OrderItem, Coupon, Product, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { withTransaction } = require('../utils/transaction');

// Obtener todas las órdenes
exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, status, type } = req.query;
    
    // Construir condiciones de filtro
    const where = {};
    
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.created_at = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Usar caché para consultas frecuentes
    const cacheKey = `orders:all:${JSON.stringify(where)}`;
    
    const orders = await cache.getOrSet(cacheKey, async () => {
      return await Order.findAll({
        where,
        order: [['created_at', 'DESC']]
      });
    }, 60); // Caché por 1 minuto
    
    res.json(orders);
  } catch (error) {
    logger.error('❌ Error al obtener órdenes:', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Obtener una orden por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Usar caché para consultas frecuentes
    const cacheKey = `orders:${id}`;
    
    const order = await cache.getOrSet(cacheKey, async () => {
      return await Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items' }]
      });
    }, 60); // Caché por 1 minuto
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json(order);
  } catch (error) {
    logger.error('❌ Error al buscar orden:', { 
      error: error.message, 
      stack: error.stack,
      orderId: req.params.id
    });
    res.status(500).json({ error: 'Error al buscar orden' });
  }
};

// Crear una orden nueva con productos
exports.create = async (req, res) => {
  try {
    const {
      type,
      customer_name,
      customer_phone,
      customer_email,
      table_number,
      delivery_address,
      delivery_date,
      total_amount,
      deposit_amount,
      discount_percentage,
      discount_amount,
      payment_method,
      total_cash_paid,
      total_non_cash_paid,
      first_payment_date,
      last_payment_date,
      created_by,
      cash_register_id,
      coupon_code,
      items
    } = req.body;

    // Validación básica
    if (!type || !total_amount || !created_by || !items || !items.length) {
      return res.status(400).json({ error: 'Faltan campos obligatorios o productos' });
    }

    // Usar la función withTransaction para manejo robusto de transacciones
    const result = await withTransaction(async (t) => {
      // Si hay un cupón, verificarlo
      let finalDiscountAmount = discount_amount || 0;
      
      if (coupon_code) {
        const coupon = await Coupon.findOne({ 
          where: { 
            code: coupon_code,
            is_active: true,
            valid_from: { [Op.lte]: new Date() },
            [Op.or]: [
              { valid_to: null },
              { valid_to: { [Op.gte]: new Date() }}
            ]
          },
          transaction: t
        });
        
        if (!coupon) {
          throw new Error('Cupón inválido o expirado');
        }
        
        // Calcular el descuento según si es porcentual o monto fijo
        if (coupon.discount_type === 'percentage') {
          finalDiscountAmount = total_amount * (coupon.discount_value / 100);
        } else {
          finalDiscountAmount = coupon.discount_value;
        }
        
        // Validar condiciones específicas del cupón
        if (coupon.min_purchase_amount > 0 && total_amount < coupon.min_purchase_amount) {
          throw new Error(`El monto mínimo para este cupón es ${coupon.min_purchase_amount}`);
        }
        
        if (coupon.cash_payment_only && payment_method !== 'efectivo') {
          throw new Error('Este cupón solo es válido para pagos en efectivo');
        }
        
        // Incrementar contador de uso del cupón
        await Coupon.update(
          { usage_count: sequelize.literal('usage_count + 1') },
          { where: { code: coupon_code }, transaction: t }
        );
      }

      // Generar código de orden
      const codePrefix = { orden: 'O', pedido: 'P', delivery: 'D', salon: 'S' }[type];

      const [results] = await sequelize.query(
        `SELECT COUNT(*) AS count FROM Orders WHERE type = ? AND CONVERT(date, created_at) = CONVERT(date, GETDATE())`,
        {
          replacements: [type],
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );
      
      const countToday = results.count;
      const orderCode = `${codePrefix}${String(countToday + 1).padStart(3, '0')}`;
      const orderId = uuidv4();

      // Insertar la orden
      await sequelize.query(
        `INSERT INTO Orders (
          id, order_code, type, status, customer_name, customer_phone, customer_email, 
          table_number, delivery_address, delivery_date, total_amount, deposit_amount,
          total_cash_paid, total_non_cash_paid, discount_percentage, discount_amount,
          payment_method, first_payment_date, last_payment_date, created_by, cash_register_id, coupon_code, created_at
        ) 
        VALUES (
          :id, :order_code, :type, :status, :customer_name, :customer_phone, :customer_email,
          :table_number, :delivery_address, :delivery_date, :total_amount, :deposit_amount,
          :total_cash_paid, :total_non_cash_paid, :discount_percentage, :discount_amount,
          :payment_method, :first_payment_date, :last_payment_date, :created_by, :cash_register_id, :coupon_code, GETDATE()
        )`,
        {
          replacements: {
            id: orderId,
            order_code: orderCode,
            type,
            status: 'pendiente',
            customer_name,
            customer_phone: customer_phone || null,
            customer_email: customer_email || null,
            table_number: table_number || null,
            delivery_address: delivery_address || null,
            delivery_date: delivery_date || null,
            total_amount,
            deposit_amount: deposit_amount || 0,
            total_cash_paid: total_cash_paid || 0,
            total_non_cash_paid: total_non_cash_paid || 0,
            discount_percentage: discount_percentage || 0,
            discount_amount: finalDiscountAmount,
            payment_method: payment_method || null,
            first_payment_date: first_payment_date || null,
            last_payment_date: last_payment_date || null,
            created_by,
            cash_register_id: cash_register_id || null,
            coupon_code: coupon_code || null
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Insertar los ítems de la orden
      for (const item of items) {
        // Validar que el producto exista si es necesario
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id, { transaction: t });
          if (!product) {
            throw new Error(`Producto no encontrado: ${item.product_id}`);
          }
        }
        
        await sequelize.query(
          `INSERT INTO OrderItems (
            id, order_id, product_id, product_name, quantity, unit_label,
            unit_price, final_price, discount_applied, subtotal, created_at
          ) VALUES (
            :id, :order_id, :product_id, :product_name, :quantity, :unit_label,
            :unit_price, :final_price, :discount_applied, :subtotal, GETDATE()
          )`,
          {
            replacements: {
              id: uuidv4(),
              order_id: orderId,
              product_id: item.product_id,
              product_name: item.product_name || '',
              quantity: item.quantity,
              unit_label: item.unit_label || 'unidad',
              unit_price: item.unit_price,
              final_price: item.final_price,
              discount_applied: item.discount_applied || 0,
              subtotal: item.quantity * item.final_price
            },
            type: sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );
      }

      // Retornar el ID de la orden creada
      return orderId;
    }, { 
      maxRetries: 3,
      initialDelay: 200
    });

    // Invalidar caché relacionada
    cache.invalidatePattern(/^orders:/);
    cache.invalidatePattern(/^dashboard:/);
    
    // Obtener la orden creada
    const [createdOrder] = await sequelize.query(
      `SELECT * FROM Orders WHERE id = :id`,
      {
        replacements: { id: result },
        type: sequelize.QueryTypes.SELECT
      }
    );

    logger.info('✅ Orden creada exitosamente', {
      orderId: result,
      orderCode: createdOrder.order_code,
      type: createdOrder.type
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    logger.error('❌ Error al crear orden:', { 
      error: error.message, 
      stack: error.stack
    });
    
    // Manejo específico de errores conocidos
    if (error.message.includes('Cupón inválido') || 
        error.message.includes('monto mínimo') ||
        error.message.includes('solo es válido') ||
        error.message.includes('Producto no encontrado')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Error al crear orden', 
      message: error.message 
    });
  }
};

// Actualizar una orden existente
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Excluir campos que no deberían actualizarse directamente
    const safeUpdateData = { ...updateData };
    delete safeUpdateData.id;
    delete safeUpdateData.order_code;
    delete safeUpdateData.created_at;
    
    // Añadir timestamp de actualización
    safeUpdateData.updated_at = new Date();
    
    await withTransaction(async (t) => {
      const [updated] = await Order.update(safeUpdateData, { 
        where: { id },
        transaction: t
      });
      
      if (updated === 0) {
        throw new Error('Orden no encontrada');
      }
      
      // Si hay ítems nuevos para actualizar
      if (updateData.items && Array.isArray(updateData.items) && updateData.items.length > 0) {
        // Opcionalmente eliminar ítems existentes
        if (updateData.replaceItems) {
          await OrderItem.destroy({
            where: { order_id: id },
            transaction: t
          });
        }
        
        // Insertar o actualizar ítems
        for (const item of updateData.items) {
          if (item.id) {
            // Actualizar ítem existente
            await OrderItem.update(
              {
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                final_price: item.final_price,
                discount_applied: item.discount_applied || 0,
                subtotal: item.quantity * item.final_price,
                updated_at: new Date()
              },
              {
                where: { id: item.id, order_id: id },
                transaction: t
              }
            );
          } else {
            // Crear nuevo ítem
            await OrderItem.create({
              id: uuidv4(),
              order_id: id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_label: item.unit_label || 'unidad',
              unit_price: item.unit_price,
              final_price: item.final_price,
              discount_applied: item.discount_applied || 0,
              subtotal: item.quantity * item.final_price
            }, { transaction: t });
          }
        }
      }
    });
    
    // Invalidar caché
    cache.invalidate(`orders:${id}`);
    cache.invalidatePattern(/^orders:all:/);
    cache.invalidatePattern(/^dashboard:/);
    
    // Recuperar la orden actualizada
    const updatedOrder = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    logger.info('✅ Orden actualizada', {
      orderId: id,
      orderCode: updatedOrder.order_code
    });
    
    res.json(updatedOrder);
  } catch (error) {
    logger.error('❌ Error al actualizar orden:', { 
      error: error.message, 
      stack: error.stack,
      orderId: req.params.id
    });
    
    if (error.message === 'Orden no encontrada') {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
};

// Eliminar una orden
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    await withTransaction(async (t) => {
      // Primero eliminar los ítems relacionados
      await OrderItem.destroy({
        where: { order_id: id },
        transaction: t
      });
      
      // Luego eliminar la orden
      const deleted = await Order.destroy({ 
        where: { id },
        transaction: t
      });
      
      if (!deleted) {
        throw new Error('Orden no encontrada');
      }
    });
    
    // Invalidar caché
    cache.invalidate(`orders:${id}`);
    cache.invalidatePattern(/^orders:all:/);
    cache.invalidatePattern(/^dashboard:/);
    
    logger.info('✅ Orden eliminada', { orderId: id });
    
    res.status(200).json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    logger.error('❌ Error al eliminar orden:', { 
      error: error.message, 
      stack: error.stack,
      orderId: req.params.id
    });
    
    if (error.message === 'Orden no encontrada') {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.status(500).json({ error: 'Error al eliminar orden' });
  }
};

// Aplicar cupón a una orden existente
exports.applyCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { coupon_code, payment_method } = req.body;
    
    if (!coupon_code) {
      return res.status(400).json({ error: 'Código de cupón requerido' });
    }
    
    const result = await withTransaction(async (t) => {
      // Verificar si la orden existe
      const order = await Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items' }],
        transaction: t
      });
      
      if (!order) {
        throw new Error('Orden no encontrada');
      }
      
      // Verificar el cupón
      const coupon = await Coupon.findOne({ 
        where: { 
          code: coupon_code,
          is_active: true,
          valid_from: { [Op.lte]: new Date() },
          [Op.or]: [
            { valid_to: null },
            { valid_to: { [Op.gte]: new Date() }}
          ]
        },
        transaction: t
      });
      
      if (!coupon) {
        throw new Error('Cupón inválido o expirado');
      }
      
      // Calcular el descuento
      let discountAmount = 0;
      
      if (coupon.discount_type === 'percentage') {
        discountAmount = order.total_amount * (coupon.discount_value / 100);
      } else {
        discountAmount = Math.min(coupon.discount_value, order.total_amount);
      }
      
      // Validar condiciones
      if (coupon.min_purchase_amount > 0 && order.total_amount < coupon.min_purchase_amount) {
        throw new Error(`El monto mínimo para este cupón es ${coupon.min_purchase_amount}`);
      }
      
      if (coupon.cash_payment_only && payment_method !== 'efectivo') {
        throw new Error('Este cupón solo es válido para pagos en efectivo');
      }
      
      // Aplicar lógica específica para pago en efectivo (si aplica)
      if (payment_method === 'efectivo' && coupon.cash_payment_only) {
        // Si el cupón es exclusivo para efectivo, aumentar el descuento
        discountAmount *= 1.1; // 10% extra por pagar en efectivo
      }
      
      // Redondear a 2 decimales
      discountAmount = Math.round(discountAmount * 100) / 100;
      
      // Actualizar la orden
      await order.update({
        coupon_code,
        discount_amount: discountAmount,
        payment_method: payment_method || order.payment_method,
        updated_at: new Date()
      }, { transaction: t });
      
      // Incrementar uso del cupón
      await Coupon.update(
        { usage_count: sequelize.literal('usage_count + 1') },
        { where: { code: coupon_code }, transaction: t }
      );
      
      return order.id;
    });
    
    // Invalidar caché
    cache.invalidate(`orders:${id}`);
    cache.invalidatePattern(/^orders:all:/);
    cache.invalidatePattern(/^dashboard:/);
    
    // Recuperar la orden actualizada
    const updatedOrder = await Order.findByPk(result, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    logger.info('✅ Cupón aplicado exitosamente', {
      orderId: id,
      couponCode: coupon_code,
      discountAmount: updatedOrder.discount_amount
    });
    
    res.json(updatedOrder);
  } catch (error) {
    logger.error('❌ Error al aplicar cupón:', { 
      error: error.message, 
      stack: error.stack,
      orderId: req.params.id,
      couponCode: req.body.coupon_code
    });
    
    if (error.message === 'Orden no encontrada') {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    if (error.message.includes('Cupón inválido') || 
        error.message.includes('monto mínimo') ||
        error.message.includes('solo es válido')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error al aplicar cupón' });
  }
};

// Buscar órdenes
exports.search = async (req, res) => {
  try {
    const { 
      term, 
      startDate, 
      endDate, 
      status, 
      type, 
      customerName, 
      minAmount, 
      maxAmount 
    } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    // Fechas
    if (startDate && endDate) {
      whereConditions.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.created_at = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Estado
    if (status) {
      whereConditions.status = status;
    }
    
    // Tipo de orden
    if (type) {
      whereConditions.type = type;
    }
    
    // Cliente
    if (customerName) {
      whereConditions.customer_name = {
        [Op.like]: `%${customerName}%`
      };
    }
    
    // Monto
    if (minAmount && maxAmount) {
      whereConditions.total_amount = {
        [Op.between]: [minAmount, maxAmount]
      };
    } else if (minAmount) {
      whereConditions.total_amount = {
        [Op.gte]: minAmount
      };
    } else if (maxAmount) {
      whereConditions.total_amount = {
        [Op.lte]: maxAmount
      };
    }
    
    // Búsqueda por término general
    if (term) {
      whereConditions[Op.or] = [
        { order_code: { [Op.like]: `%${term}%` } },
        { customer_name: { [Op.like]: `%${term}%` } },
        { customer_phone: { [Op.like]: `%${term}%` } },
        { customer_email: { [Op.like]: `%${term}%` } }
      ];
    }
    
    const orders = await Order.findAll({
      where: whereConditions,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit: 50 // Limitar resultados para mejor rendimiento
    });
    
    logger.info('Búsqueda de órdenes realizada', {
      termLength: term?.length,
      resultsCount: orders.length,
      filters: {
        startDate,
        endDate,
        status,
        type,
        customerName,
        minAmount,
        maxAmount
      }
    });
    
    res.json(orders);
  } catch (error) {
    logger.error('❌ Error al buscar órdenes:', { 
      error: error.message, 
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ error: 'Error al buscar órdenes' });
  }
};

// Obtener estadísticas de órdenes
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parsear fechas o usar últimos 30 días por defecto
    const end = endDate ? new Date(endDate) : new Date();
    
    let start;
    if (startDate) {
      start = new Date(startDate);
    } else {
      start = new Date();
      start.setDate(start.getDate() - 30);
    }
    
    // Clave de caché basada en fechas
    const cacheKey = `orders:stats:${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}`;
    
    const stats = await cache.getOrSet(cacheKey, async () => {
      // Obtener estadísticas por tipo de orden
      const typeStats = await Order.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
        ],
        where: {
          created_at: {
            [Op.between]: [start, end]
          }
        },
        group: ['type']
      });
      
      // Obtener estadísticas por estado
      const statusStats = await Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
        ],
        where: {
          created_at: {
            [Op.between]: [start, end]
          }
        },
        group: ['status']
      });
      
      // Obtener estadísticas por día
      const dailyStats = await sequelize.query(
        `SELECT CONVERT(date, created_at) as date, 
          COUNT(*) as count, 
          SUM(total_amount) as total 
        FROM Orders 
        WHERE created_at BETWEEN :start AND :end 
        GROUP BY CONVERT(date, created_at) 
        ORDER BY CONVERT(date, created_at)`,
        {
          replacements: { start, end },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      // Obtener total general
      const [totalStats] = await sequelize.query(
        `SELECT 
          COUNT(*) as total_orders, 
          SUM(total_amount) as total_amount,
          AVG(total_amount) as average_amount,
          MIN(total_amount) as min_amount,
          MAX(total_amount) as max_amount
        FROM Orders 
        WHERE created_at BETWEEN :start AND :end`,
        {
          replacements: { start, end },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      return {
        period: {
          start_date: start,
          end_date: end,
          days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        },
        summary: {
          total_orders: parseInt(totalStats.total_orders || 0),
          total_amount: parseFloat(totalStats.total_amount || 0),
          average_amount: parseFloat(totalStats.average_amount || 0),
          min_amount: parseFloat(totalStats.min_amount || 0),
          max_amount: parseFloat(totalStats.max_amount || 0)
        },
        by_type: typeStats.map(stat => ({
          type: stat.type,
          count: parseInt(stat.getDataValue('count')),
          total: parseFloat(stat.getDataValue('total') || 0)
        })),
        by_status: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.getDataValue('count')),
          total: parseFloat(stat.getDataValue('total') || 0)
        })),
        by_day: dailyStats.map(day => ({
          date: day.date,
          count: parseInt(day.count),
          total: parseFloat(day.total || 0)
        }))
      };
    }, 300); // Caché por 5 minutos
    
    res.json(stats);
  } catch (error) {
    logger.error('❌ Error al obtener estadísticas de órdenes:', { 
      error: error.message, 
      stack: error.stack
    });
    res.status(500).json({ error: 'Error al obtener estadísticas de órdenes' });
  }
};

module.exports = exports;