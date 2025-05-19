// backend/scripts/create-image-tables.js
const sequelize = require('../config/database');
const { Image, ImageLink } = require('../models');

async function createImageTables() {
  try {
    // Sincronizar ambos modelos en la base de datos
    await Image.sync({ alter: true });
    await ImageLink.sync({ alter: true });
    
    console.log('✅ Tablas de imágenes creadas o actualizadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tablas de imágenes:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createImageTables();
}

module.exports = createImageTables;