// backend/routes/image.routes.js

const express = require('express');
const router = express.Router();

const imageController = require('../controllers/image.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');
const upload = require('../middlewares/upload.middleware');

// 🔼 Subir una o varias imágenes
router.post(
  '/',
  verifyToken,
  requirePermission('gestionar_imagenes'),
  upload.array('images', 10),  // key: images
  imageController.upload
);

// 🔽 Eliminar una imagen por ID
router.delete(
  '/:id',
  verifyToken,
  requirePermission('gestionar_imagenes'),
  imageController.remove
);

// 🔍 Obtener imágenes asociadas a un objeto
router.get(
  '/',
  verifyToken,
  requirePermission('gestionar_imagenes'),
  imageController.getByOwner
);

// 📥 Servir imagen (ej. desde ID para <img src="/api/images/1" />)
router.get(
  '/:id',
  imageController.getById // público, o podés agregar auth si es necesario
);

module.exports = router;