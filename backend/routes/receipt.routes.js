// backend/routes/receipt.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/receipt.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Rutas para gestión de comprobantes
router.post('/', requirePermission('procesar_pagos'), controller.generateReceipt);
router.get('/', requirePermission('ver_comprobantes'), controller.getAllReceipts);
router.get('/:id', requirePermission('ver_comprobantes'), controller.getReceiptById);
router.put('/:id/void', requirePermission('anular_comprobantes'), controller.voidReceipt);
router.get('/report', requirePermission('ver_reportes'), controller.generateReport);

module.exports = router;