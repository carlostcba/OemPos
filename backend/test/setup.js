// backend/tests/setup.js

const supertest = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');

// Resetear la base de datos antes de cada test
const resetDatabase = async () => {
  await sequelize.sync({ force: true });
  
  // Cargar datos de prueba
  await require('./fixtures/load')();
};

// Cliente de prueba
const request = supertest(app);

module.exports = {
  resetDatabase,
  request
};