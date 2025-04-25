// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas válidas
router.post('/login', authController.login);
router.post('/register', authController.register); // si está habilitado

module.exports = router;
