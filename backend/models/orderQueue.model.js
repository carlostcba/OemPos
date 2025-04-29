// backend/models/orderQueue.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderQueue = sequelize.define('OrderQueue', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  queue_position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'waiting'
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
