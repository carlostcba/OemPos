const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category.model');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  }
}, {
  tableName: 'Subcategories',
  timestamps: false
});

module.exports = Subcategory;
