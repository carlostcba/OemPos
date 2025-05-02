// backend/models/permission.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'Permissions',
  timestamps: false
});

module.exports = Permission;
