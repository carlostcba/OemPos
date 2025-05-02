// backend/middlewares/compression.js

const compression = require('compression');

module.exports = compression({
  level: 6, // Nivel de compresión (0-9)
  threshold: 1024, // Comprimir solo respuestas mayores a 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Comprimir todo excepto imágenes (que ya están comprimidas)
    return !(/\.(jpg|jpeg|png|gif|webp)$/i.test(req.path));
  }
});