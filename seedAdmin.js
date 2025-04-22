const bcrypt = require('bcrypt');
const { User } = require('./models');
const sequelize = require('./config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();

    const existing = await User.findOne({ where: { username: 'admin' } });

    if (existing) {
      console.log('ℹ️ Ya existe un usuario admin. No se creó uno nuevo.');
      return process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin', 10);

    await User.create({
      username: 'admin',
      password: passwordHash, // Sequelize lo guarda como password_hash
      role: 'admin'
    });

    console.log('✅ Usuario admin creado con éxito');
    process.exit();
  } catch (err) {
    console.error('❌ Error al crear usuario admin:', err);
    process.exit(1);
  }
}

createAdmin();
