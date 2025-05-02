// backend/middlewares/rateLimiter.js

const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

// Limitador para rutas de autenticación
const authLimiter = new RateLimiterMemory({
  points: 5, // 5 intentos
  duration: 60, // por minuto
  blockDuration: 300, // bloquear por 5 minutos
});

// Limitador general para todas las rutas
const apiLimiter = new RateLimiterMemory({
  points: 60, // 60 solicitudes
  duration: 60, // por minuto
});

// Middleware para rutas de autenticación
exports.authRateLimiter = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn('Demasiados intentos de autenticación', { ip: req.ip });
    res.status(429).json({
      error: 'Demasiados intentos. Por favor, intente nuevamente más tarde.'
    });
  }
};

// Middleware para otras rutas de la API
exports.apiRateLimiter = async (req, res, next) => {
  try {
    await apiLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn('Demasiadas solicitudes a la API', { ip: req.ip, path: req.path });
    res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor, reduzca la frecuencia.'
    });
  }
};