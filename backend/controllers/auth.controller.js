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
  const { username, password } = req.body;
  const user = await User.findOne({
    where: { username },
    include: {
      model: Role,
      as: 'roles',
      attributes: ['id', 'name'],
      through: { attributes: [] } // evita datos del join table
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const roleNames = user.roles.map(role => role.name);

  const token = jwt.sign(
    { id: user.id, username: user.username, roles: roleNames },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
};

