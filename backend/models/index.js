// backend/models/index.js

const sequelize = require('../config/database');
const Product = require('./product.model');
const Category = require('./category.model');
const Subcategory = require('./subcategory.model');
const ProductImage = require('./productImage.model');
const User = require('./user.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const OrderQueue = require('./orderQueue.model');
const Role = require('./role.model');
const Permission = require('./permission.model');

// 🔗 Relaciones de productos
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });
Product.belongsTo(ProductImage, { foreignKey: 'product_image_id', as: 'image' });
Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 🔗 Relaciones de órdenes
Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// 🔗 Relaciones de ítems de orden
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ✅ Relaciones de usuarios y roles
// Relación directa a través de role_id
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Relación muchos a muchos a través de UserRoles
User.belongsToMany(Role, {
  through: 'UserRoles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: 'UserRoles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// ✅ Relaciones de roles y permisos
Role.belongsToMany(Permission, {
  through: 'RolePermissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: 'RolePermissions',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// 📦 Exportar todo
module.exports = {
  sequelize,
  Product,
  Category,
  Subcategory,
  ProductImage,
  User,
  Order,
  OrderItem,
  OrderQueue,
  Role,
  Permission
};