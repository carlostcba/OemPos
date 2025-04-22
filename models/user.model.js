const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash' // <- ¡esto es fundamental!
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'Users',
  timestamps: false
});

module.exports = User;
