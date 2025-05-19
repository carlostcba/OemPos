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
  (req, res, next) => {
    // Si el usuario es vendedor o tiene el permiso gestionar_imagenes, permitir acceso
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      // En caso contrario, usar el middleware normal de permisos
      return requirePermission('gestionar_imagenes')(req, res, next);
    }
  },
  upload.array('images', 10),  // key: images
  imageController.upload
);

// 🔽 Eliminar una imagen por ID
router.delete(
  '/:id',
  verifyToken,
  (req, res, next) => {
    // Si el usuario es vendedor o tiene el permiso gestionar_imagenes, permitir acceso
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      // En caso contrario, usar el middleware normal de permisos
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
    // Si el usuario es vendedor o tiene el permiso gestionar_imagenes, permitir acceso
    if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('gestionar_imagenes')) {
      return next();
    } else {
      // En caso contrario, usar el middleware normal de permisos
      return requirePermission('gestionar_imagenes')(req, res, next);
    }
  },
  imageController.getByOwner
);

// 📥 Servir imagen (ej. desde ID para <img src="/api/images/1" />)
router.get(
  '/:id',
  imageController.getById // público, o podés agregar auth si es necesario
);

module.exports = router;