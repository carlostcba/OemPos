// backend/models/imageLink.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageLink = sequelize.define('ImageLink', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'images',
      key: 'id'
    }
  },
  owner_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  owner_id: {
    type: DataTypes.STRING(50),  // Cambio a STRING para aceptar UUIDs
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'default'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'image_links',
  timestamps: false
});

module.exports = ImageLink;