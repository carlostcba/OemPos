// backend/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

// Rutas para categorías
router.get('/', verifyToken, requirePermission('ver_productos'), categoryController.getAll);
router.get('/:id', verifyToken, requirePermission('ver_productos'), categoryController.getById);
router.post('/', verifyToken, requirePermission('gestionar_productos'), categoryController.create);
router.put('/:id', verifyToken, requirePermission('gestionar_productos'), categoryController.update);
router.delete('/:id', verifyToken, requirePermission('gestionar_productos'), categoryController.remove);

module.exports = router;