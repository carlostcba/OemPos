// backend/scripts/test-sql-connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usar directamente las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE,
        connectTimeout: 60000,
        requestTimeout: 60000
      }
    },
    logging: console.log
  }
);

async function testConnection() {
  try {
    console.log('Intentando conectar a SQL Server...');
    console.log('Configuración:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Usuario: ${process.env.DB_USER}`);
    console.log(`Contraseña: ${'*'.repeat(process.env.DB_PASSWORD.length)}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    console.log(`Instancia: ${process.env.DB_INSTANCE}`);
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');
    
    // Intentar listar tablas para verificar el acceso a la base de datos
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas en la base de datos:', tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:');
    console.error('Mensaje:', error.message);
    
    if (error.original) {
      console.error('Error original:', error.original.message);
      console.error('Código:', error.original.code);
    }
    
    // Recomendaciones basadas en el tipo de error
    if (error.name === 'SequelizeAccessDeniedError') {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verifica que el usuario y contraseña sean correctos');
      console.log('2. Asegúrate que el usuario tiene permisos para acceder a la base de datos');
      console.log('3. Si usas autenticación de Windows, configura dialectOptions.options.trustedConnection = true');
    } else if (error.original && error.original.code === 'ESOCKET') {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verifica que el servicio SQL Server está ejecutándose');
      console.log('2. Comprueba que la instancia SQLEXPRESS está configurada correctamente');
      console.log('3. Intenta conectarte usando SQL Server Management Studio para validar');
    }
    
    process.exit(1);
  }
}

testConnection();