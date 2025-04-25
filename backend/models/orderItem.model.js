// backend/models/orderItem.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(100), // Desnormalizado para reportes rápidos
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2), // Precio base del producto al momento de venta
    allowNull: false
  },
  discount_applied: {
    type: DataTypes.DECIMAL(10, 2), // Descuento total aplicado en este item
    defaultValue: 0
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2), // Precio final por unidad luego del descuento
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3), // Soporte para productos pesables
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2), // final_price * quantity
    allowNull: false
  },
  unit_label: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  is_weighable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  coupon_code: {
    type: DataTypes.STRING(50),
    allowNull: true // Sólo si el cupón afecta por ítem
  }
}, {
  tableName: 'OrderItems',
  timestamps: false
});

module.exports = OrderItem;
