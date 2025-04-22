const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  plu_code: {
    type: DataTypes.STRING(4),
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_weighable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  unit_label: {
    type: DataTypes.STRING(20),
    defaultValue: 'unidad'
  },
  stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  track_stock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allow_discount: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.STRING(255),
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
  tableName: 'Products',
  timestamps: false
});

module.exports = Product;
