// backend/config/cors.js

const allowedOrigins = {
  development: [
    'http://localhost:8100',
    'http://localhost:3000',
    'capacitor://localhost',
    'ionic://localhost'
  ],
  production: [
    'https://admin.oempos.com',
    'https://app.oempos.com'
  ]
};

const currentEnv = process.env.NODE_ENV || 'development';

module.exports = {
  origin: allowedOrigins[currentEnv],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
