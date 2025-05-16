// backend/middlewares/upload.middleware.js

const multer = require('multer');

const storage = multer.memoryStorage(); // en RAM, luego la estrategia decide

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // máximo 5MB por imagen
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
