const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING, // almacena hash
  role: DataTypes.STRING // admin, vendedor, cajero, etc
}, {});

module.exports = User;
