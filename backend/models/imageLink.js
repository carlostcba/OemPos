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
    type: DataTypes.CHAR(36), // ← Cambiar de STRING a CHAR(36) para UUIDs
    allowNull: false,
    references: {
      model: 'images',
      key: 'id'
    }
  },
  owner_type: {
    type: DataTypes.STRING(50), // ← Mantener como STRING pero con límite
    allowNull: false
  },
  owner_id: {
    type: DataTypes.CHAR(36), // ← Cambiar a CHAR(36) para UUIDs de productos
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING(50), // ← Con límite
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