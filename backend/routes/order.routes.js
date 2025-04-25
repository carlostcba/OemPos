// backend/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/authJwt');

// Todas las rutas requieren token
router.use(verifyToken);

// Listar todas las órdenes
router.get('/', orderController.getAll);

// Obtener una orden por ID
router.get('/:id', orderController.getById);

// Crear una nueva orden
router.post('/', orderController.create);

// Actualizar una orden
router.put('/:id', orderController.update);

// Eliminar una orden
router.delete('/:id', orderController.remove);

module.exports = router;
