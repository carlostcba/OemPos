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
      include: [
        {
          model: Role,
          as: 'role', // Relación directa
          attributes: ['id', 'name']
        },
        {
          model: Role,
          as: 'roles', // Relación muchos a muchos
          through: { attributes: [] },
          include: [{
            model: Permission,
            as: 'permissions',
            through: { attributes: [] } // Agregar esta línea
          }]
        }
      ]
    });   
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 🧠 Consolidar lista de permisos del usuario de ambas relaciones
    let userPermissions = [];
    
    // Permisos de la relación muchos a muchos
    const manyToManyPermissions = user.roles?.flatMap(role =>
      role.permissions?.map(perm => perm.name) || []
    ) || [];
    
    // Si tiene permisos directos a través de role_id, los agregamos 
    // (necesitarías añadir esta relación en la tabla Roles o consultar directamente)
    
    userPermissions = [...new Set([...manyToManyPermissions])];
    
    // 🧠 Debug completo
    console.log('🧠 Usuario autenticado:', {
      id: user.id,
      username: user.username,
      roleDirecto: user.role?.name,
      rolesMuchos: user.roles?.map(r => r.name),
      permisos: userPermissions
    });
    
    req.user.permissions = userPermissions;
    next(); // Solo una llamada a next()
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

// ✅ Middleware para verificar si el usuario tiene un rol específico
const requireRole = (role) => (req, res, next) => {
  if (!req.user?.roles?.includes(role)) {
    return res.status(403).json({ error: `Acceso denegado: se requiere el rol "${role}"` });
  }
  next();
};

// ✅ Exportaciones
module.exports = {
  verifyToken,
  requirePermission,
  requireRole
};