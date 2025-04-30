// backend/routes/image.routes.js

const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.post('/', verifyToken, requirePermission('gestionar_imagenes'), imageController.upload);
router.delete('/:id', verifyToken, requirePermission('gestionar_imagenes'), imageController.remove);

module.exports = router;
