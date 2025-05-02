// backend/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Rutas para gestión de inventario
router.post('/movement', requirePermission('gestionar_inventario'), controller.registerMovement);
router.get('/product/:product_id', requirePermission('ver_inventario'), controller.getProductMovements);
router.post('/order/:order_id', requirePermission('procesar_pagos'), controller.updateInventoryFromOrder);
router.post('/stocktake', requirePermission('gestionar_inventario'), controller.performStockTake);
router.get('/report', requirePermission('ver_reportes'), controller.generateInventoryReport);

module.exports = router;