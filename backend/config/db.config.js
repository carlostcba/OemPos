require('dotenv').config();

module.exports = {
  dialect: process.env.DB_DIALECT || 'mssql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gustados',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: false,
      instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
      connectTimeout: 60000,
      requestTimeout: 60000
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};
