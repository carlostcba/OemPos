// backend/middlewares/errorHandler.js

module.exports = (err, req, res, next) => {
    console.error('❌ Error no capturado:', err);
    
    // Errores de Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
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
        error: 'Error de autenticación',
        message: err.message
      });
    }
    
    // Errores generales
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Se produjo un error inesperado'
    });
  };