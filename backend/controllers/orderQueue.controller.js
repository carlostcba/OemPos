// backend/controllers/orderQueue.controller.js
const { OrderQueue, Order, OrderItem } = require('../models');
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

// Llamar al siguiente cliente
exports.callNext = async (req, res) => {
  try {
    // Buscar la primera orden en espera ordenada por prioridad y posición
    const nextInQueue = await OrderQueue.findOne({
      where: { status: 'waiting' },
      order: [
        ['priority', 'DESC'],
        ['queue_position', 'ASC']
      ]
    });
    
    if (!nextInQueue) {
      return res.status(404).json({ error: 'No hay órdenes en espera' });
    }
    
    // Actualizar a estado "called"
    await nextInQueue.update({
      status: 'called',
      called_at: new Date()
    });
    
    // Buscar información de la orden
    const order = await Order.findByPk(nextInQueue.order_id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    res.json({
      queueEntry: nextInQueue,
      order
    });
    
  } catch (error) {
    console.error('❌ Error al llamar al siguiente cliente:', error);
    res.status(500).json({ error: 'Error al llamar al siguiente cliente' });
  }
};

// Marcar como procesada
exports.markAsProcessed = async (req, res) => {
  try {
    const entry = await OrderQueue.findByPk(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    await entry.update({
      status: 'processed',
      processed_at: new Date()
    });
    
    res.json(entry);
    
  } catch (error) {
    console.error('❌ Error al marcar como procesada:', error);
    res.status(500).json({ error: 'Error al marcar como procesada' });
  }
};

// Reordenar la cola
exports.reorder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      await t.rollback();
      return res.status(400).json({ error: 'Formato inválido' });
    }
    
    // Actualizar posiciones
    for (let i = 0; i < entries.length; i++) {
      await OrderQueue.update(
        { queue_position: i + 1 },
        { 
          where: { id: entries[i].id },
          transaction: t
        }
      );
    }
    
    await t.commit();
    
    const updatedQueue = await OrderQueue.findAll({
      order: [['queue_position', 'ASC']]
    });
    
    res.json(updatedQueue);
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al reordenar cola:', error);
    res.status(500).json({ error: 'Error al reordenar cola' });
  }
};