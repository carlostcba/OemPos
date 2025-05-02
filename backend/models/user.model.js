// backend/models/user.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: false
});

module.exports = User;