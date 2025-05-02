// backend/routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Rutas para el dashboard
router.get('/summary', requirePermission('ver_reportes'), dashboardController.getSummary);
router.get('/sales-by-category', requirePermission('ver_reportes'), dashboardController.getSalesByCategory);
router.get('/daily-sales', requirePermission('ver_reportes'), dashboardController.getDailySales);
router.get('/top-products', requirePermission('ver_reportes'), dashboardController.getTopProducts);
router.get('/payment-methods', requirePermission('ver_reportes'), dashboardController.getPaymentMethodStats);
router.get('/inventory', requirePermission('ver_reportes'), dashboardController.getInventoryStats);

module.exports = router;