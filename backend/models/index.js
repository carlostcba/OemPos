// backend/models/index.js

const sequelize = require('../config/database');
const Product = require('./product.model');
const Category = require('./category.model');
const Subcategory = require('./subcategory.model');
const ProductImage = require('./productImage.model');
const User = require('./user.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

// Relaciones de productos
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Product.belongsTo(Subcategory, {
  foreignKey: 'subcategory_id',
  as: 'subcategory'
});

Product.belongsTo(ProductImage, {
  foreignKey: 'product_image_id',
  as: 'image'
});

Product.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Relaciones de órdenes
Order.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

// Relaciones de ítems de orden
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Exportación de modelos
module.exports = {
  sequelize,
  Product,
  Category,
  Subcategory,
  ProductImage,
  User,
  Order,
  OrderItem
};
