// backend/models/orderQueue.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderQueue = sequelize.define('OrderQueue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 2 // 1 = urgente, 2 = normal
  },
  queue_position: {
    type: DataTypes.INTEGER,
    allowNull: true // la vamos a calcular al insertar
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'pendiente' // pendiente, llamado, entregado, cancelado
  },
  called_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'OrderQueue',
  timestamps: false
});

module.exports = OrderQueue;
