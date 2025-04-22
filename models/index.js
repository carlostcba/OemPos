const sequelize = require('../config/database');
const Product = require('./product.model');
const Category = require('./category.model');
const Subcategory = require('./subcategory.model');
const ProductImage = require('./productImage.model');
const User = require('./user.model');

// Relaciones
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

// Exportación de modelos
module.exports = {
  sequelize,
  Product,
  Category,
  Subcategory,
  ProductImage,
  User
};
