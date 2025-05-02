// backend/utils/transaction.js

const sequelize = require('../config/database');

/**
 * Ejecuta una función dentro de una transacción con reintentos
 * @param {Function} callback - Función a ejecutar dentro de la transacción
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<*>} - Resultado de la función callback
 */
const withTransaction = async (callback, options = {}) => {
  const { maxRetries = 3, initialDelay = 100 } = options;
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      
      // Si es un error de concurrencia, reintentamos
      if (error.name === 'SequelizeOptimisticLockError') {
        lastError = error;
        retries++;
        
        if (retries < maxRetries) {
          // Espera exponencial entre reintentos
          const delay = initialDelay * Math.pow(2, retries - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Para otros errores, no reintentamos
        throw error;
      }
    }
  }
  
  throw lastError;
};

module.exports = { withTransaction };