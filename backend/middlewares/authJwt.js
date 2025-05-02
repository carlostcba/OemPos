// backend/middlewares/authJwt.js
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const SECRET = process.env.JWT_SECRET || 'secreto123';

// ✅ Middleware que verifica el token JWT y carga los permisos del usuario
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    // 🔍 Cargar usuario con sus roles y permisos desde la base
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      }]
    });   
    

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 🧠 Consolidar lista de permisos del usuario
    const userPermissions = user.roles.flatMap(role =>
      role.permissions.map(perm => perm.name)
    );
    
    // 🧠 Debug completo
    console.log('🧠 Usuario autenticado:', {
      id: user.id,
      username: user.username,
      roles: user.roles?.map(r => r.name),
      permisos: userPermissions
    });
    
    req.user.permissions = userPermissions;
    next();

    req.user.permissions = userPermissions;
    next();
  } catch (err) {
    console.error('❌ Error verificando token:', err.message);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// ✅ Middleware para verificar si el usuario tiene un permiso específico
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user?.permissions?.includes(permission)) {
    return res.status(403).json({ error: `Acceso denegado: falta el permiso "${permission}"` });
  }
  next();
};

// ✅ Exportaciones
module.exports = {
  verifyToken,
  requirePermission
};
