// backend/config/database.js (modificado)

const { Sequelize } = require('sequelize');
const dbConfig = require('./db.config');
const config = require('./config');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    dialectOptions: {
      ...dbConfig.dialectOptions,
      // Asegurar que las fechas se manejen correctamente
      options: {
        ...dbConfig.dialectOptions.options,
        useUTC: false, // No usar UTC en las consultas
        dateFirst: 1,  // Formato de fecha europeo (DD/MM/YYYY)
      }
    },
    timezone: config.timeZone, // Configurar zona horaria para Sequelize
    pool: dbConfig.pool,
    logging: dbConfig.logging
  }
);

module.exports = sequelize;