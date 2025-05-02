// backend/models/cashRegister.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashRegister = sequelize.define('CashRegister', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  opening_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  closing_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  expected_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  difference_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'balanced'),
    defaultValue: 'open'
  },
  opened_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  closed_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  opening_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  closing_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  opened_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'CashRegisters',
  timestamps: false
});

module.exports = CashRegister;