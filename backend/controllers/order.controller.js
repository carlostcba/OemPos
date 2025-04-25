// backend/controllers/order.controller.js
const { Order } = require('../models');
const { Op } = require('sequelize');

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
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (error) {
    console.error('❌ Error al buscar orden:', error);
    res.status(500).json({ error: 'Error al buscar orden' });
  }
};

// Crear una orden nueva
exports.create = async (req, res) => {
  try {
    const {
      type,
      customer_name,
      customer_phone,
      customer_email,
      table_number,
      delivery_date,
      total_amount,
      deposit_amount,
      discount_percentage,
      discount_amount,
      total_amount_with_discount,
      payment_method,
      total_cash_paid,
      first_payment_date,
      last_payment_date,
      created_by,
      cash_register_id,
      coupon_code
    } = req.body;

    if (!type || !total_amount || !created_by) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const codePrefix = {
      orden: 'O',
      pedido: 'P',
      delivery: 'D',
      salon: 'S'
    }[type];

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const countToday = await Order.count({
      where: {
        type,
        created_at: { [Op.gte]: startOfDay }
      }
    });

    const padded = String(countToday + 1).padStart(3, '0');
    const code = `${codePrefix}${padded}`;

    const order = await Order.create({
      ...req.body,
      code
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden', message: error.message });
  }
};

// Actualizar una orden existente
exports.update = async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, {
      where: { id: req.params.id }
    });
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
