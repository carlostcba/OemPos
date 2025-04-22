const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  image: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ProductImages',
  timestamps: false
});

module.exports = ProductImage;
