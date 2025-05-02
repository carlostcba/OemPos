// backend/routes/orderQueue.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderQueue.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Rutas básicas
router.get('/', requirePermission('ver_orden'), controller.getAll);
router.post('/', requirePermission('crear_orden'), controller.create);
router.put('/:id', requirePermission('modificar_orden'), controller.update);
router.delete('/:id', requirePermission('eliminar_orden'), controller.remove);

// Nuevas rutas para manejo de cola
router.post('/call-next', requirePermission('procesar_pagos'), controller.callNext);
router.post('/:id/process', requirePermission('procesar_pagos'), controller.markAsProcessed);
router.post('/reorder', requirePermission('gestionar_cola'), controller.reorder);

module.exports = router;