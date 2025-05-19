// backend/middlewares/errorHandler.js
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Generar ID único para el error para facilitar la búsqueda en logs
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  // Log detallado del error
  logger.error(`Error no capturado [${errorId}]`, { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?.username,
    body: Object.keys(req.body || {})
  });
  
  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      errorId,
      error: 'Error de validación en la base de datos',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Errores de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      errorId,
      error: 'Error de autenticación',
      message: err.message
    });
  }
  
  // Errores generales
  res.status(500).json({
    errorId,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Se produjo un error inesperado',
    // Incluir el ID del error en la respuesta para facilitar el soporte
    supportReference: `Referencia de soporte: ${errorId}`
  });
};