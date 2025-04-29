const express = require('express');
const router = express.Router();
const orderQueueController = require('../controllers/orderQueue.controller'); // ✅ corregido
const { verifyToken } = require('../middlewares/authJwt');

// Todas las rutas requieren token
router.use(verifyToken);

// Listar la cola de pedidos
router.get('/', orderQueueController.getAll);

// Agregar un pedido a la cola
router.post('/', orderQueueController.create);

// Actualizar un pedido de la cola
router.put('/:id', orderQueueController.update);

// Eliminar un pedido de la cola
router.delete('/:id', orderQueueController.remove);

module.exports = router;
