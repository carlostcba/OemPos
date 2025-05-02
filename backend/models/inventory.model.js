// backend/models/inventory.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  movement_type: {
    type: DataTypes.ENUM('sale', 'purchase', 'adjustment', 'return', 'stock_take'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  previous_stock: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  new_stock: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'InventoryMovements',
  timestamps: false
});

module.exports = InventoryMovement;