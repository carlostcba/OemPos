// backend/models/Image.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.CHAR(36), // ← Asegurar que sea CHAR(36)
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ruta relativa en disco'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL para acceso directo (CDN/cloud)'
  },
  reference_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de referencia en servicio externo'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre del archivo con extensión'
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre original del archivo subido'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tamaño en bytes'
  },
  storage_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'disk',
    comment: 'disk | database | cloud'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Metadatos adicionales en formato JSON'
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
  tableName: 'images',
  timestamps: false,
  indexes: [
    {
      name: 'idx_images_storage_type',
      fields: ['storage_type']
    }
  ]
});

module.exports = Image;