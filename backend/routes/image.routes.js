// backend/routes/image.routes.js

const express = require('express');
const router = express.Router();

const imageController = require('../controllers/image.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');
const upload = require('../middlewares/upload.middleware');
const corsConfig = require('../config/cors');

// 🔼 Subir una o varias imágenes
router.post(
  '/',
  verifyToken,
  (req, res, next) => {
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      return requirePermission('gestionar_imagenes')(req, res, next);
    }
  },
  upload.array('images', 10),
  imageController.upload
);

// 🔽 Eliminar una imagen por ID
router.delete(
  '/:id',
  verifyToken,
  (req, res, next) => {
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      return requirePermission('gestionar_imagenes')(req, res, next);
    }
  },
  imageController.remove
);

// 🔍 Obtener imágenes asociadas a un objeto
router.get(
  '/',
  verifyToken,
  (req, res, next) => {
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      return requirePermission('gestionar_imagenes')(req, res, next);
    }
  },
  imageController.getByOwner
);

// 📥 Servir imagen
router.get('/:id', async (req, res) => {
  try {
    const origin = req.headers.origin;
    const allowedOrigins = corsConfig.origin;

    if (origin && Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');

    const served = await imageController.getById(req, res);
    if (!served && !res.headersSent) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error al servir imagen:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al obtener la imagen.' });
    }
  }
});

// 🔗 Actualizar vínculo de imagen
router.put(
  '/link',
  verifyToken,
  requirePermission('gestionar_imagenes'),
  imageController.updateImageLink
);

module.exports = router;
