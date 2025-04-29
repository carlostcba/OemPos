const express = require('express');
const router = express.Router();
const orderQueueController = require('../controllers/orderQueue.controller');
const { verifyToken } = require('../middlewares/authJwt');

// ✅ Todas las rutas protegidas por token
router.use(verifyToken);

// Listar toda la cola
router.get('/', orderQueueController.getAll);

// Obtener una entrada específica
router.get('/:id', orderQueueController.getById);

// Crear una nueva entrada en la cola
router.post('/', orderQueueController.create);

// Actualizar una entrada de la cola
router.put('/:id', orderQueueController.update);

// Eliminar una entrada de la cola
router.delete('/:id', orderQueueController.remove);

module.exports = router;
