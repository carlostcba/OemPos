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
const CashRegister = require('./cashRegister.model');
const CashTransaction = require('./cashTransaction.model');
const Receipt = require('./receipt.model');
const InventoryMovement = require('./inventory.model');
const Coupon = require('./coupon.model');
const Image = require('./Image');
const ImageLink = require('./imageLink');
const ImageBinary = require('./ImageBinary');

// 🔗 Relaciones de categorías y subcategorías
Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });
Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 🔗 Relaciones de productos
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });
Product.belongsTo(ProductImage, { foreignKey: 'product_image_id', as: 'image' });
Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Product.hasMany(InventoryMovement, { foreignKey: 'product_id', as: 'inventory_movements' });


// Relaciones inversas para categorías
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Subcategory.hasMany(Product, { foreignKey: 'subcategory_id', as: 'products' });

// 🔗 Relaciones de órdenes
Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
Order.hasOne(Receipt, { foreignKey: 'order_id', as: 'receipt' });
Order.belongsTo(CashRegister, { foreignKey: 'cash_register_id', as: 'cash_register' });
Order.hasMany(CashTransaction, { foreignKey: 'order_id', as: 'transactions' });
Order.hasOne(OrderQueue, { foreignKey: 'order_id', as: 'queue_entry' });
OrderQueue.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 🔗 Relaciones de ítems de orden
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 🔗 Relaciones de caja
CashRegister.belongsTo(User, { foreignKey: 'opened_by', as: 'opener' });
CashRegister.belongsTo(User, { foreignKey: 'closed_by', as: 'closer' });
CashRegister.hasMany(CashTransaction, { foreignKey: 'cash_register_id', as: 'transactions' });
CashRegister.hasMany(Order, { foreignKey: 'cash_register_id', as: 'orders' });

// 🔗 Relaciones de transacciones de caja
CashTransaction.belongsTo(CashRegister, { foreignKey: 'cash_register_id', as: 'cash_register' });
CashTransaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
CashTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 🔗 Relaciones de comprobantes
Receipt.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Receipt.belongsTo(User, { foreignKey: 'issued_by', as: 'issuer' });
Receipt.belongsTo(User, { foreignKey: 'voided_by', as: 'voider' });

// 🔗 Relaciones de inventario
InventoryMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
InventoryMovement.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
InventoryMovement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ✅ Relaciones de imágenes y enlaces
Image.hasMany(ImageLink, { foreignKey: 'image_id', as: 'links' });
ImageLink.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

// ✅ Relaciones de usuarios y roles
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Relación muchos a muchos a través de UserRoles
User.belongsToMany(Role, {
  through: 'UserRoles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false
});

Role.belongsToMany(User, {
  through: 'UserRoles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
  timestamps: false
});

// ✅ Relaciones de roles y permisos
Role.belongsToMany(Permission, {
  through: 'RolePermissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
  timestamps: false
});

Permission.belongsToMany(Role, {
  through: 'RolePermissions',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false
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
  Permission,
  CashRegister,
  CashTransaction,
  Receipt,
  InventoryMovement,
  Coupon,
  Image,
  ImageLink,
  ImageBinary
};