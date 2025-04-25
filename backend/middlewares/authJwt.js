// backend/middlewares

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secreto123';

// ✅ Verifica que el token sea válido
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// ✅ Middleware para controlar roles (ej: admin)
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: 'Acceso denegado: permiso insuficiente' });
  }
  next();
};
