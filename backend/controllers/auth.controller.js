// backend/controllers/auth.controller.js

const { User, Role, Permission } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secreto123';

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      username, 
      password: hash, 
      role_id: role // Si se proporciona un role_id
    });
    
    res.status(201).json({ 
      id: user.id, 
      username: user.username 
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Iniciando login para usuario:', username);
    
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: 'role', // Relación directa
          attributes: ['id', 'name']
        },
        {
          model: Role,
          as: 'roles', // Relación muchos a muchos
          attributes: ['id', 'name'],
          through: { attributes: [] },
          include: [{
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }]
        }
      ]
    });

    if (!user) {
      console.log('❌ Usuario no encontrado:', username);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta para usuario:', username);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // ✅ Combinar roles de ambas relaciones
    const directRole = user.role ? [user.role.name] : [];
    const manyToManyRoles = user.roles?.map(role => role.name) || [];
    const roleNames = [...new Set([...directRole, ...manyToManyRoles])];

    // ✅ Combinar permisos de todas las relaciones de roles
    const allPermissions = user.roles?.flatMap(role =>
      role.permissions?.map(perm => perm.name) || []
    ) || [];

    // ✅ Agregar permisos implícitos según el rol
    const rolesToPermissions = {
      'vendedor': ['ver_productos', 'crear_producto', 'modificar_producto', 'gestionar_imagenes'],
      'cajero': ['ver_caja', 'ver_ordenes', 'procesar_pagos'],
      'supervisor': ['ver_reportes', 'ver_inventario'],
      'admin': ['gestionar_usuarios', 'gestionar_sistema', 'ver_productos', 'crear_producto', 'modificar_producto', 'eliminar_producto']
    };

    // Agregar permisos implícitos
    const implicitPermissions = [];
    roleNames.forEach(rol => {
      if (rolesToPermissions[rol]) {
        implicitPermissions.push(...rolesToPermissions[rol]);
      }
    });

    // ✅ Combinar todos los permisos (explícitos + implícitos)
    const finalPermissions = [...new Set([...allPermissions, ...implicitPermissions])];

    // Debug de información para el token
    console.log('🔑 Generando token para:', { 
      id: user.id, 
      username: user.username, 
      roles: roleNames,
      permissions: finalPermissions
    });

    // ✅ Token con toda la información necesaria
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        roles: roleNames,
        permissions: finalPermissions
      },
      SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Login exitoso para usuario:', username);
    console.log('📋 Roles asignados:', roleNames);
    console.log('🔑 Permisos asignados:', finalPermissions.length, 'permisos');

    res.json({ token });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.verifyToken = (req, res) => {
  console.log('🔍 Verificando token para usuario:', req.user?.username);
  console.log('📋 Roles del usuario:', req.user?.roles);
  console.log('🔑 Permisos del usuario:', req.user?.permissions?.length, 'permisos');
  
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      roles: req.user.roles,
      permissions: req.user.permissions
    }
  });
};