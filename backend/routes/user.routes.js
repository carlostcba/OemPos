// backend/routes/user.routes.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { verifyToken, requirePermission } = require('../middlewares/authJwt');

router.get('/', verifyToken, requirePermission('ver_usuarios'), controller.getAll);
router.post('/', verifyToken, requirePermission('gestionar_usuarios'), controller.create);

module.exports = router;
