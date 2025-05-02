// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authJwt');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Ruta para verificar token (protegida)
router.get('/verify-token', verifyToken, authController.verifyToken);

module.exports = router;