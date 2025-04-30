// backend/routes/order.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

router.get('/', requirePermission('ver_ordenes'), controller.getAll);
router.get('/:id', requirePermission('ver_ordenes'), controller.getById);
router.post('/', requirePermission('crear_orden'), controller.create);
router.put('/:id', requirePermission('modificar_orden'), controller.update);
router.delete('/:id', requirePermission('eliminar_orden'), controller.remove);

module.exports = router;
