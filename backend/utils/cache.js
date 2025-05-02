// backend/utils/cache.js

const NodeCache = require('node-cache');
const logger = require('./logger');

// Cache con TTL de 5 minutos por defecto
const cache = new NodeCache({ 
  stdTTL: 300, 
  checkperiod: 60,
  useClones: false
});

/**
 * Obtiene un valor de la caché o lo calcula si no existe
 * @param {string} key - Clave para el valor en caché
 * @param {Function} fetchFunction - Función para obtener el valor si no está en caché
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {Promise<*>} - Valor de la caché o recién calculado
 */
exports.getOrSet = async (key, fetchFunction, ttl = 300) => {
  const cachedValue = cache.get(key);
  
  if (cachedValue !== undefined) {
    logger.debug('Cache hit', { key });
    return cachedValue;
  }
  
  logger.debug('Cache miss', { key });
  const value = await fetchFunction();
  
  cache.set(key, value, ttl);
  return value;
};

/**
 * Invalida una clave específica en la caché
 * @param {string} key - Clave a invalidar
 */
exports.invalidate = (key) => {
  logger.debug('Invalidando caché', { key });
  cache.del(key);
};

/**
 * Invalida todas las claves que coincidan con un patrón
 * @param {RegExp} pattern - Patrón para las claves a invalidar
 */
exports.invalidatePattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => pattern.test(key));
  
  logger.debug('Invalidando caché por patrón', { 
    pattern: pattern.toString(),
    matchingKeys
  });
  
  matchingKeys.forEach(key => cache.del(key));
};

/**
 * Limpia toda la caché
 */
exports.flush = () => {
  logger.debug('Limpiando toda la caché');
  cache.flushAll();
};