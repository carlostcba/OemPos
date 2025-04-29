// backend/models/order.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_code: {  // Cambiado de "code" a "order_code" para coincidir con la base de datos
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('orden', 'pedido', 'delivery', 'salon'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'esperando_retiro', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  customer_name: {
    type: DataTypes.STRING(100)
  },
  customer_phone: {
    type: DataTypes.STRING(30)
  },
  customer_email: {
    type: DataTypes.STRING(100)
  },
  table_number: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  delivery_address: {  // Añadido campo para dirección de entrega
    type: DataTypes.STRING(255),
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_amount_with_discount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_method: {
    type: DataTypes.STRING(50)
  },
  total_cash_paid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_non_cash_paid: { // Añadido campo para pagos no en efectivo
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  first_payment_date: {
    type: DataTypes.DATE
  },
  last_payment_date: {
    type: DataTypes.DATE
  },
  coupon_code: {
    type: DataTypes.STRING(50)
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  cash_register_id: {
    type: DataTypes.UUID,
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
  tableName: 'Orders',
  timestamps: false
});

module.exports = Order;