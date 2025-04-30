// backend/routes/orderQueue.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderQueue.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.use(verifyToken);

// Reemplazá esto 👇
router.get('/', requirePermission('ver_orden'), controller.getAll);

// Y agregá lo que corresponda para create, update, delete si hace falta
router.post('/', requirePermission('crear_orden'), controller.create);
router.put('/:id', requirePermission('modificar_orden'), controller.update);
router.delete('/:id', requirePermission('eliminar_orden'), controller.remove);

module.exports = router;
