// backend/controllers/orderQueue.controller.js
const { OrderQueue } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Obtener toda la cola de órdenes
exports.getAll = async (req, res) => {
  try {
    const queue = await OrderQueue.findAll({ order: [['queue_position', 'ASC']] });
    res.json(queue);
  } catch (error) {
    console.error('❌ Error al obtener la cola:', error);
    res.status(500).json({ error: 'Error al obtener la cola' });
  }
};

// Obtener una entrada de cola por ID
exports.getById = async (req, res) => {
  try {
    const entry = await OrderQueue.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entrada no encontrada' });
    res.json(entry);
  } catch (error) {
    console.error('❌ Error al buscar entrada:', error);
    res.status(500).json({ error: 'Error al buscar entrada' });
  }
};

// Crear una nueva entrada en la cola
exports.create = async (req, res) => {
  try {
    const { order_id, priority } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Falta order_id' });
    }

    const currentMaxPosition = await OrderQueue.max('queue_position') || 0;

    const entry = await OrderQueue.create({
      id: uuidv4(),
      order_id,
      priority: priority || 0,
      queue_position: currentMaxPosition + 1,
      status: 'waiting',
      created_at: new Date()
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('❌ Error al crear entrada en cola:', error);
    res.status(500).json({ error: 'Error al crear entrada' });
  }
};

// Actualizar una entrada de la cola
exports.update = async (req, res) => {
  try {
    const [updated] = await OrderQueue.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) return res.status(404).json({ error: 'Entrada no encontrada' });
    const updatedEntry = await OrderQueue.findByPk(req.params.id);
    res.json(updatedEntry);
  } catch (error) {
    console.error('❌ Error al actualizar entrada en cola:', error);
    res.status(500).json({ error: 'Error al actualizar entrada' });
  }
};

// Eliminar una entrada de la cola
exports.remove = async (req, res) => {
  try {
    const deleted = await OrderQueue.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Entrada no encontrada' });
    res.status(200).json({ message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar entrada de cola:', error);
    res.status(500).json({ error: 'Error al eliminar entrada' });
  }
};
