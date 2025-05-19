// backend/models/ImageBinary.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageBinary = sequelize.define('ImageBinary', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  }
}, {
  tableName: 'image_binaries',
  timestamps: false
});

module.exports = ImageBinary;