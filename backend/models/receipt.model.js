// backend/models/receipt.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  receipt_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_partial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  issued_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_voided: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  voided_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  voided_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  voided_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Receipts',
  timestamps: false
});

module.exports = Receipt;