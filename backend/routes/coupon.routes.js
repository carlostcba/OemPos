// backend/routes/coupon.routes.js

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { verifyToken, requireRole, requirePermission } = require('../middlewares/authJwt');

// Todas las rutas requieren token
router.use(verifyToken);

// Rutas públicas (vendedores pueden consultar)
router.get('/', couponController.getAll);
router.get('/code/:code', couponController.getByCode);
router.post('/verify', couponController.verify);
router.post('/increment-usage/:code', couponController.incrementUsage);
router.post('/calculate', couponController.calculateDiscount);

// Rutas privadas (solo admin)
router.post('/', requireRole('admin'), couponController.create);
router.put('/:id', requireRole('admin'), couponController.update);
router.delete('/:id', requireRole('admin'), couponController.remove);

module.exports = router;