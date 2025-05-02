// backend/models/cashTransaction.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashTransaction = sequelize.define('CashTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cash_register_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('income', 'expense', 'deposit', 'withdrawal', 'adjustment'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'efectivo'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING(100),
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
  tableName: 'CashTransactions',
  timestamps: false
});

module.exports = CashTransaction;