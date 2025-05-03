const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { User } = require('./models');
const sequelize = require('./config/database');

// Mapa de roles con sus IDs (debe coincidir con los de tu base de datos)
const roles = {
  admin: '091854C2-7399-44A3-B3F5-69AC6FC050F5',
  cajero: '2AE6000B-6B38-4AFD-992F-68912C08E661',
  vendedor: '460D8A7D-63AD-423A-B55A-20AA1B4D86CA',
  supervisor: '5EA981D5-B627-45B6-B770-6CC8A3FA0063',
};

async function createUsers() {
  try {
    await sequelize.authenticate();

    for (const [username, role_id] of Object.entries(roles)) {
      const existing = await User.findOne({ where: { username } });

      if (existing) {
        console.log(`ℹ️ Ya existe el usuario '${username}'. No se creó uno nuevo.`);
        continue;
      }

      const passwordHash = await bcrypt.hash(username, 10);

      await User.create({
        id: uuidv4(),
        username,
        password_hash: passwordHash,
        role_id,
        created_at: new Date(),
      });

      console.log(`✅ Usuario '${username}' creado con éxito.`);
    }

    process.exit();
  } catch (err) {
    console.error('❌ Error al crear los usuarios:', err);
    process.exit(1);
  }
}

createUsers();