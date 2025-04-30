// backend/routes/product.routes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

// Todas las rutas protegidas con token y permisos basados en base de datos

router.get('/', verifyToken, requirePermission('ver_productos'), productController.getAll);
router.post('/', verifyToken, requirePermission('crear_producto'), productController.create);
router.put('/:id', verifyToken, requirePermission('modificar_producto'), productController.update);
router.delete('/:id', verifyToken, requirePermission('eliminar_producto'), productController.remove);

module.exports = router;

