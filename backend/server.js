// backend/server.js (mejorado)

require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./utils/logger');
const config = require('./config/config');

const PORT = config.server.port;

// Manejo mejorado de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  // En producción podríamos enviar notificaciones aquí
  
  // Salir con error después de cerrar bien las conexiones
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { 
    reason: reason.message || reason, 
    stack: reason.stack
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Recibida señal: ${signal}, iniciando apagado graceful...`);
  
  try {
    // Cerrar conexiones a base de datos
    await sequelize.close();
    logger.info('Conexiones a base de datos cerradas.');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error durante el apagado:', { error: error.message });
    process.exit(1);
  }
};

// Capturar señales de terminación
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
});

// Función de inicio
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    logger.info('✅ Conexión a base de datos exitosa');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      logger.info('✅ Modelos sincronizados');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
      logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', { 
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

startServer();