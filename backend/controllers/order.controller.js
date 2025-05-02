// backend/controllers/order.controller.js
const { Order, OrderItem, Coupon, Product, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Asegúrate de tener esta dependencia instalada

// Obtener todas las órdenes
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Obtener una orden por ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (error) {
    console.error('❌ Error al buscar orden:', error);
    res.status(500).json({ error: 'Error al buscar orden' });
  }
};

// Crear una orden nueva con productos
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
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

    if (!type || !total_amount || !created_by || !items || !items.length) {
      return res.status(400).json({ error: 'Faltan campos obligatorios o productos' });
    }

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
        }
      });
      
      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ error: 'Cupón inválido o expirado' });
      }
      
      // Calcular el descuento según si es porcentual o monto fijo
      if (coupon.discount_type === 'percentage') {
        finalDiscountAmount = total_amount * (coupon.discount_value / 100);
      } else {
        finalDiscountAmount = coupon.discount_value;
      }
      
      // Validar condiciones específicas del cupón
      if (coupon.min_purchase_amount > 0 && total_amount < coupon.min_purchase_amount) {
        await t.rollback();
        return res.status(400).json({ 
          error: `El monto mínimo para este cupón es ${coupon.min_purchase_amount}` 
        });
      }
      
      if (coupon.cash_payment_only && payment_method !== 'efectivo') {
        await t.rollback();
        return res.status(400).json({ 
          error: 'Este cupón solo es válido para pagos en efectivo' 
        });
      }
      
      // Incrementar contador de uso del cupón
      await Coupon.update(
        { usage_count: sequelize.literal('usage_count + 1') },
        { where: { code: coupon_code }, transaction: t }
      );
    }

    const codePrefix = { orden: 'O', pedido: 'P', delivery: 'D', salon: 'S' }[type];

    const [results] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM Orders WHERE type = ? AND CONVERT(date, created_at) = CONVERT(date, GETDATE())`,
      {
        replacements: [type],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    const countToday = results.count;
    const orderCode = `${codePrefix}${String(countToday + 1).padStart(3, '0')}`;
    const orderId = uuidv4();

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
          discount_amount: finalDiscountAmount, // Usamos el descuento calculado
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

    for (const item of items) {
      await sequelize.query(
        `INSERT INTO OrderItems (
          id, order_id, product_id, product_name, quantity, unit_label,
          unit_price, final_price, discount_applied, created_at
        ) VALUES (
          :id, :order_id, :product_id, :product_name, :quantity, :unit_label,
          :unit_price, :final_price, :discount_applied, GETDATE()
        )`,
        {
          replacements: {
            id: uuidv4(),
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product_name || '',
            quantity: item.quantity,
            unit_label: item.unit_label || '',
            unit_price: item.unit_price,
            final_price: item.final_price,
            discount_applied: item.discount_applied || 0
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );
    }

    await t.commit();

    const [createdOrder] = await sequelize.query(
      `SELECT * FROM Orders WHERE id = :id`,
      {
        replacements: { id: orderId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden', message: error.message });
  }
};

// Actualizar una orden existente
exports.update = async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, { where: { id: req.params.id } });
    if (updated === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    const updatedOrder = await Order.findByPk(req.params.id);
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
};

// Eliminar una orden
exports.remove = async (req, res) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Orden no encontrada' });
    res.status(200).json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error al eliminar orden' });
  }
};

// Aplicar cupón a una orden existente
exports.applyCoupon = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { coupon_code, payment_method } = req.body;
    
    // Verificar si la orden existe
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });
    
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
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
      await t.rollback();
      return res.status(400).json({ error: 'Cupón inválido o expirado' });
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
      await t.rollback();
      return res.status(400).json({ 
        error: `El monto mínimo para este cupón es ${coupon.min_purchase_amount}` 
      });
    }
    
    if (coupon.cash_payment_only && payment_method !== 'efectivo') {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Este cupón solo es válido para pagos en efectivo' 
      });
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
    
    await t.commit();
    
    // Recuperar la orden actualizada
    const updatedOrder = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    res.json(updatedOrder);
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al aplicar cupón:', error);
    res.status(500).json({ error: 'Error al aplicar cupón' });
  }
};