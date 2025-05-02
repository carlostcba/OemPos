// backend/controllers/optimizations.js

// Ejemplo de optimización para consultas frecuentes
const getActiveProductsWithCategories = async () => {
    // Usar findAll con eager loading pero seleccionando solo los campos necesarios
    return await Product.findAll({
      attributes: ['id', 'name', 'price', 'stock'],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      where: { is_active: true }
    });
  };
  
  // Cache simple en memoria para consultas frecuentes
  const cache = new Map();
  const TTL = 5 * 60 * 1000; // 5 minutos
  
  const getCachedData = async (key, fetchFunction) => {
    const now = Date.now();
    if (cache.has(key)) {
      const { data, timestamp } = cache.get(key);
      if (now - timestamp < TTL) {
        return data;
      }
    }
    
    const freshData = await fetchFunction();
    cache.set(key, { data: freshData, timestamp: now });
    return freshData;
  };
  
  module.exports = {
    getActiveProductsWithCategories,
    getCachedData
  };