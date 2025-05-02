// backend/routes/cashRegister.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/cashRegister.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Rutas para gestión de caja
router.post('/open', requirePermission('abrir_caja'), controller.openRegister);
router.put('/:id/close', requirePermission('cerrar_caja'), controller.closeRegister);
router.get('/', requirePermission('ver_historial_caja'), controller.getAllRegisters);
router.get('/current', requirePermission('ver_caja'), controller.getCurrentRegister);
router.get('/:id', requirePermission('ver_historial_caja'), controller.getRegisterById);
router.post('/transaction', requirePermission('procesar_pagos'), controller.addTransaction);
router.get('/:id/report', requirePermission('ver_reportes'), controller.generateReport);

module.exports = router;