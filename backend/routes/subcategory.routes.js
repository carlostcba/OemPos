// backend/routes/subcategory.routes.js
const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategory.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

// Rutas para subcategorías
router.get('/', verifyToken, requirePermission('ver_productos'), subcategoryController.getAll);
router.get('/:id', verifyToken, requirePermission('ver_productos'), subcategoryController.getById);
router.post('/', verifyToken, requirePermission('gestionar_productos'), subcategoryController.create);
router.put('/:id', verifyToken, requirePermission('gestionar_productos'), subcategoryController.update);
router.delete('/:id', verifyToken, requirePermission('gestionar_productos'), subcategoryController.remove);

module.exports = router;