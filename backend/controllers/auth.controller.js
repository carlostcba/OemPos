const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secreto123';

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, password: hash, role });
  res.status(201).json({ id: user.id, username: user.username });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          include: [{
            model: Permission,
            as: 'permissions'
          }]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Combinar roles de ambas relaciones
    const directRole = user.role ? [user.role.name] : [];
    const manyToManyRoles = user.roles?.map(role => role.name) || [];
    const roleNames = [...new Set([...directRole, ...manyToManyRoles])];

    console.log('Generando token para:', { 
      id: user.id, 
      username: user.username, 
      roles: roleNames
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, roles: roleNames },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

