// backend/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');
const logger = require('../utils/logger');

// Middleware personalizado para la ruta de productos con logging detallado
const productAccessMiddleware = (req, res, next) => {
  logger.info('Acceso a ruta de productos', {
    method: req.method,
    path: req.path,
    user: req.user?.username,
    roles: req.user?.roles,
    permissions: req.user?.permissions
  });
  
  // Regla normal: usar requirePermission('ver_productos')
  requirePermission('ver_productos')(req, res, next);
};

// Rutas protegidas con logging detallado
router.get('/search', verifyToken, productController.getByName);  // 👈 Primero rutas específicas si lo colocas debajo no te va a funcionar
router.get('/', verifyToken, productAccessMiddleware, productController.getAll);
router.get('/:id', verifyToken, requirePermission('ver_productos'), productController.getById);
router.post('/', verifyToken, requirePermission('crear_producto'), productController.create);
router.put('/:id', verifyToken, requirePermission('modificar_producto'), productController.update);
router.delete('/:id', verifyToken, requirePermission('eliminar_producto'), productController.remove);


module.exports = router;