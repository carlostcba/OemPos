// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authJwt'); // Importar el middleware

// Rutas válidas
router.post('/login', authController.login);
router.post('/register', authController.register); // si está habilitado

// Ruta para verificar token
router.get('/verify-token', verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      roles: req.user.roles,
      permissions: req.user.permissions
    }
  });
});

module.exports = router;