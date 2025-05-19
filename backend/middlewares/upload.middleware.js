// backend/middlewares/upload.middleware.js

const multer = require('multer');
const logger = require('../utils/logger');

const storage = multer.memoryStorage(); // en RAM, luego la estrategia decide

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // máximo 5MB por imagen
    files: 10 // máximo 10 archivos a la vez
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      logger.warn('Intento de carga de archivo no permitido', { mimetype: file.mimetype });
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    
    // Permitir el archivo
    logger.info('Archivo aceptado para carga', { 
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    cb(null, true);
  }
});

module.exports = upload;