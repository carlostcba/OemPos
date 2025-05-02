// backend/controllers/inventory.controller.js
const { InventoryMovement, Product, Order, OrderItem, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Registrar movimiento de inventario
exports.registerMovement = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, order_id, movement_type, quantity, notes } = req.body;
    
    // Verificar si el producto existe
    const product = await Product.findByPk(product_id, { transaction: t });
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Verificar que se realice seguimiento de stock para este producto
    if (!product.track_stock) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'No se realiza seguimiento de stock para este producto' 
      });
    }
    
    // Obtener stock actual
    const currentStock = parseFloat(product.stock);
    
    // Calcular nuevo stock según tipo de movimiento
    let newStock = currentStock;
    
    if (['purchase', 'return', 'adjustment'].includes(movement_type)) {
      newStock = currentStock + parseFloat(quantity);
    } else if (movement_type === 'sale') {
      newStock = currentStock - parseFloat(quantity);
      
      // Verificar stock suficiente para ventas
      if (newStock < 0) {
        await t.rollback();
        return res.status(400).json({ 
          error: 'Stock insuficiente',
          current_stock: currentStock,
          requested: quantity
        });
      }
    }
    
    // Registrar movimiento
    const movement = await InventoryMovement.create({
      product_id,
      order_id,
      movement_type,
      quantity,
      previous_stock: currentStock,
      new_stock: newStock,
      notes,
      created_by: req.user.id
    }, { transaction: t });
    
    // Actualizar stock del producto
    await product.update({ 
      stock: newStock,
      updated_at: new Date()
    }, { transaction: t });
    
    await t.commit();
    
    // Recuperar movimiento con relaciones
    const createdMovement = await InventoryMovement.findByPk(movement.id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { 
          model: Order, 
          as: 'order',
          attributes: ['id', 'order_code', 'type'],
          required: false
        }
      ]
    });
    
    res.status(201).json(createdMovement);
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al registrar movimiento de inventario:', error);
    res.status(500).json({ error: 'Error al registrar movimiento de inventario' });
  }
};

// Obtener historial de movimientos de un producto
exports.getProductMovements = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verificar si el producto existe
    const product = await Product.findByPk(product_id);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Construir condiciones de filtro
    const where = { product_id };
    
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
    
    const movements = await InventoryMovement.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { 
          model: Order, 
          as: 'order',
          attributes: ['id', 'order_code', 'type'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(movements);
  } catch (error) {
    console.error('❌ Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// Actualizar inventario basado en una orden
exports.updateInventoryFromOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { order_id } = req.params;
    
    // Verificar si la orden existe
    const order = await Order.findByPk(order_id, {
      include: [
        { model: OrderItem, as: 'items' }
      ],
      transaction: t
    });
    
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Verificar si ya se actualizó el inventario para esta orden
    const existingMovements = await InventoryMovement.count({
      where: { order_id },
      transaction: t
    });
    
    if (existingMovements > 0) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'El inventario ya fue actualizado para esta orden' 
      });
    }
    
    const results = [];
    const errors = [];
    
    // Procesar cada ítem de la orden
    for (const item of order.items) {
      // Obtener producto
      const product = await Product.findByPk(item.product_id, { transaction: t });
      
      if (!product) {
        errors.push({
          product_id: item.product_id,
          error: 'Producto no encontrado'
        });
        continue;
      }
      
      // Verificar seguimiento de stock
      if (!product.track_stock) {
        continue; // Saltar productos sin seguimiento
      }
      
      const currentStock = parseFloat(product.stock);
      const quantityToReduce = parseFloat(item.quantity);
      const newStock = currentStock - quantityToReduce;
      
      // Verificar stock suficiente
      if (newStock < 0) {
        errors.push({
          product_id: item.product_id,
          product_name: item.product_name,
          error: 'Stock insuficiente',
          current_stock: currentStock,
          requested: quantityToReduce
        });
        continue;
      }
      
      // Registrar movimiento
      const movement = await InventoryMovement.create({
        product_id: item.product_id,
        order_id,
        movement_type: 'sale',
        quantity: quantityToReduce,
        previous_stock: currentStock,
        new_stock: newStock,
        notes: `Orden ${order.order_code}`,
        created_by: req.user.id
      }, { transaction: t });
      
      // Actualizar stock del producto
      await product.update({ 
        stock: newStock,
        updated_at: new Date()
      }, { transaction: t });
      
      results.push({
        product_id: item.product_id,
        product_name: item.product_name,
        previous_stock: currentStock,
        quantity: quantityToReduce,
        new_stock: newStock,
        movement_id: movement.id
      });
    }
    
    // Si hay errores, revertir transacción
    if (errors.length > 0) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Error al actualizar inventario',
        details: errors
      });
    }
    
    await t.commit();
    
    res.json({
      order_id,
      order_code: order.order_code,
      updated_items: results.length,
      results
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al actualizar inventario desde orden:', error);
    res.status(500).json({ error: 'Error al actualizar inventario desde orden' });
  }
};

// Realizar toma de inventario
exports.performStockTake = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, notes } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Se requiere al menos un ítem' });
    }
    
    const results = [];
    const errors = [];
    
    // Procesar cada ítem
    for (const item of items) {
      const { product_id, actual_stock } = item;
      
      if (!product_id || actual_stock === undefined) {
        errors.push({
          item,
          error: 'Datos de ítem incompletos'
        });
        continue;
      }
      
      // Obtener producto
      const product = await Product.findByPk(product_id, { transaction: t });
      
      if (!product) {
        errors.push({
          product_id,
          error: 'Producto no encontrado'
        });
        continue;
      }
      
      // Verificar seguimiento de stock
      if (!product.track_stock) {
        continue; // Saltar productos sin seguimiento
      }
      
      const currentStock = parseFloat(product.stock);
      const newStock = parseFloat(actual_stock);
      const difference = newStock - currentStock;
      
      // Determinar tipo de movimiento
      const movementType = difference >= 0 ? 'adjustment' : 'adjustment';
      
      // Registrar movimiento
      const movement = await InventoryMovement.create({
        product_id,
        movement_type: movementType,
        quantity: Math.abs(difference),
        previous_stock: currentStock,
        new_stock: newStock,
        notes: notes || 'Toma de inventario',
        created_by: req.user.id
      }, { transaction: t });
      
      // Actualizar stock del producto
      await product.update({ 
        stock: newStock,
        updated_at: new Date()
      }, { transaction: t });
      
      results.push({
        product_id,
        product_name: product.name,
        previous_stock: currentStock,
        actual_stock: newStock,
        difference,
        movement_id: movement.id
      });
    }
    
    await t.commit();
    
    res.json({
      date: new Date(),
      total_items: results.length,
      notes,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al realizar toma de inventario:', error);
    res.status(500).json({ error: 'Error al realizar toma de inventario' });
  }
};

// Generar reporte de inventario
exports.generateInventoryReport = async (req, res) => {
  try {
    const { category_id, low_stock, inactive } = req.query;
    
    // Construir condiciones
    const where = {};
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    if (low_stock === 'true') {
      where.stock = {
        [Op.lt]: Sequelize.literal('5') // Umbral de stock bajo
      };
      where.track_stock = true;
    }
    
    if (inactive === 'true') {
      where.is_active = false;
    } else if (inactive === 'false') {
      where.is_active = true;
    }
    
    // Obtener productos
    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Subcategory, as: 'subcategory' }
      ],
      order: [
        ['track_stock', 'DESC'],
        ['stock', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    // Estadísticas
    const stats = {
      total_count: products.length,
      active_count: products.filter(p => p.is_active).length,
      inactive_count: products.filter(p => !p.is_active).length,
      low_stock_count: products.filter(p => p.track_stock && p.stock < 5).length,
      zero_stock_count: products.filter(p => p.track_stock && p.stock <= 0).length,
      tracked_count: products.filter(p => p.track_stock).length,
      not_tracked_count: products.filter(p => !p.track_stock).length,
      total_stock_value: products.reduce((sum, p) => {
        if (p.track_stock) {
          return sum + (parseFloat(p.stock) * parseFloat(p.price));
        }
        return sum;
      }, 0)
    };
    
    // Preparar informe
    const report = {
      date: new Date(),
      filter: {
        category_id: category_id || 'all',
        low_stock: low_stock === 'true',
        inactive: inactive
      },
      stats,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        plu_code: p.plu_code,
        price: parseFloat(p.price),
        is_active: p.is_active,
        track_stock: p.track_stock,
        stock: p.track_stock ? parseFloat(p.stock) : null,
        stock_value: p.track_stock ? parseFloat(p.stock) * parseFloat(p.price) : null,
        is_low_stock: p.track_stock && p.stock < 5,
        is_out_of_stock: p.track_stock && p.stock <= 0,
        category: p.category?.name,
        subcategory: p.subcategory?.name
      }))
    };
    
    res.json(report);
  } catch (error) {
    console.error('❌ Error al generar reporte de inventario:', error);
    res.status(500).json({ error: 'Error al generar reporte de inventario' });
  }
};