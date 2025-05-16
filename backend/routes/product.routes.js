// backend/routes/product.routes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requirePermission, requireRole } = require('../middlewares/authJwt');

// Modificar la ruta GET para permitir a los vendedores ver productos
router.get('/', verifyToken, (req, res, next) => {
  // Si el usuario es vendedor o tiene el permiso ver_productos, permitir acceso
  if (req.user?.roles?.includes('vendedor') || req.user?.permissions?.includes('ver_productos')) {
    return next();
  } else {
    // En caso contrario, usar el middleware normal de permisos
    return requirePermission('ver_productos')(req, res, next);
  }
}, productController.getAll);

// El resto de las rutas se mantienen igual
router.post('/', verifyToken, requirePermission('crear_producto'), productController.create);
router.put('/:id', verifyToken, requirePermission('modificar_producto'), productController.update);
router.delete('/:id', verifyToken, requirePermission('eliminar_producto'), productController.remove);
router.get('/:id', verifyToken, requirePermission('ver_producto'), productController.getById);

module.exports = router;