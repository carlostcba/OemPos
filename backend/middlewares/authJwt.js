// backend/middlewares/authJwt.js

const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const logger = require('../utils/logger');

const SECRET = process.env.JWT_SECRET || 'secreto123';

// ✅ Middleware mejorado para verificar token JWT
const verifyToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    
    // Verificar formato del header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Token mal formateado o no proporcionado', { 
        path: req.path, 
        header: authHeader 
      });
      return res.status(401).json({ error: 'Token no proporcionado o formato incorrecto' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      
      // Cargar usuario con roles y permisos
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            include: [{
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }]
          }
        ]
      });
      
      if (!user) {
        logger.warn('Usuario no encontrado en base de datos', { userId: decoded.id });
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      
      // Consolidar permisos
      const manyToManyPermissions = user.roles?.flatMap(role =>
        role.permissions?.map(perm => perm.name) || []
      ) || [];
      
      req.user.permissions = [...new Set([...manyToManyPermissions])];
      
      // Añadir permisos específicos basados en rol
      const rolesToPermissions = {
        'vendedor': ['ver_productos'],
        'cajero': ['ver_caja', 'ver_ordenes'],
        'supervisor': ['ver_reportes', 'ver_inventario']
      };
      
      // Agregar permisos implícitos según el rol
      req.user.roles.forEach(rol => {
        if (rolesToPermissions[rol]) {
          rolesToPermissions[rol].forEach(perm => {
            if (!req.user.permissions.includes(perm)) {
              req.user.permissions.push(perm);
            }
          });
        }
      });
      
      logger.info('Usuario autenticado con éxito', { 
        username: user.username,
        roles: req.user.roles,
        permissions: req.user.permissions.length
      });
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn('Token expirado', { path: req.path });
        return res.status(401).json({ error: 'Token expirado. Por favor, inicie sesión nuevamente.' });
      } else if (err.name === 'JsonWebTokenError') {
        logger.warn('Token inválido', { error: err.message });
        return res.status(401).json({ error: 'Token inválido' });
      } else {
        logger.error('Error en verificación de token', { error: err.message });
        return res.status(500).json({ error: 'Error al verificar token' });
      }
    }
  } catch (err) {
    logger.error('Error general en middleware de autenticación', { error: err.message });
    next(err);
  }
};

// ✅ Middleware para verificar permiso específico o rol
const requirePermission = (permission) => (req, res, next) => {
  // Si tiene el permiso específico o es admin, permitir acceso
  if (req.user?.permissions?.includes(permission) || req.user?.roles?.includes('admin')) {
    return next();
  }
  
  logger.warn('Acceso denegado por falta de permiso', { 
    username: req.user?.username,
    requiredPermission: permission,
    userPermissions: req.user?.permissions || []
  });
  return res.status(403).json({ error: `Acceso denegado: falta el permiso "${permission}"` });
};

// Middleware para verificar rol
const requireRole = (role) => (req, res, next) => {
  if (!req.user?.roles?.includes(role)) {
    logger.warn('Acceso denegado por falta de rol', { 
      username: req.user?.username,
      requiredRole: role,
      userRoles: req.user?.roles || []
    });
    return res.status(403).json({ error: `Acceso denegado: se requiere el rol "${role}"` });
  }
  next();
};

// Middleware para verificar roles o permisos
const requireRoleOrPermission = (roles, permissions) => (req, res, next) => {
  // Convertir a arrays si no lo son
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions];
  
  // Verificar si tiene alguno de los roles
  const hasRole = rolesToCheck.some(role => req.user?.roles?.includes(role));
  
  // Verificar si tiene alguno de los permisos
  const hasPermission = permissionsToCheck.some(permission => 
    req.user?.permissions?.includes(permission)
  );
  
  // Si tiene al menos un rol o un permiso, permitir acceso
  if (hasRole || hasPermission) {
    return next();
  }
  
  // Caso contrario, denegar acceso
  return res.status(403).json({ 
    error: `Acceso denegado: se requiere alguno de los roles ${rolesToCheck.join(', ')} o permisos ${permissionsToCheck.join(', ')}` 
  });
};

module.exports = {
  verifyToken,
  requirePermission,
  requireRole,
  requireRoleOrPermission
};