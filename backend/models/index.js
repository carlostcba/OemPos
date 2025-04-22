const Product = require('./product.model');
const User = require('./user.model');
const Category = require('./category.model');
const Subcategory = require('./subcategory.model');
const ProductImage = require('./productImage.model');

// Relaciones
Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });
Product.belongsTo(ProductImage, { foreignKey: 'product_image_id', as: 'image' });

Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  Product,
  User,
  Category,
  Subcategory,
  ProductImage
};
