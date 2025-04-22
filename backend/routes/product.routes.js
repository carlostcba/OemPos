const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middlewares/authJwt');

// Solo usuarios autenticados pueden ver productos
router.get('/', verifyToken, productController.getAll);

// Solo admins pueden crear/modificar/eliminar productos
router.post('/', verifyToken, requireRole('admin'), productController.create);
router.put('/:id', verifyToken, requireRole('admin'), productController.update);
router.delete('/:id', verifyToken, requireRole('admin'), productController.remove);

module.exports = router;
