// backend/scripts/sql-diagnostics.js
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Función para ejecutar comandos
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando comando: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Error estándar: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function diagnose() {
  console.log('🔍 Iniciando diagnóstico de conexión a SQL Server...');
  
  // 1. Verificar archivo .env
  const envPath = path.resolve(__dirname, '../.env');
  console.log('\n📄 Verificando archivo .env...');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env encontrado en:', envPath);
    
    // Leer el archivo .env para diagnóstico
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    const dbConfig = {};
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          dbConfig[key.trim()] = value.trim();
        }
      }
    });
    
    console.log('📋 Configuración de base de datos encontrada:');
    console.log('- Host:', dbConfig.DB_HOST || 'No definido');
    console.log('- Usuario:', dbConfig.DB_USER || 'No definido');
    console.log('- Contraseña:', dbConfig.DB_PASSWORD ? '******' : 'No definida');
    console.log('- Base de datos:', dbConfig.DB_NAME || 'No definida');
    console.log('- Instancia:', dbConfig.DB_INSTANCE || 'No definida');
    console.log('- Dialecto:', dbConfig.DB_DIALECT || 'No definido');
  } else {
    console.log('❌ No se encontró el archivo .env');
    console.log('📝 Creando archivo .env básico...');
    
    const basicEnv = `DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=LaSalle2599
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql
JWT_SECRET=secreto123
PORT=3001
NODE_ENV=development`;
    
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Archivo .env creado con configuración básica');
  }
  
  // 2. Verificar servicio de SQL Server
  console.log('\n🔄 Verificando servicio de SQL Server...');
  try {
    const serviceStatus = await runCommand('sc query MSSQL$SQLEXPRESS');
    console.log(serviceStatus);
    
    if (serviceStatus.includes('RUNNING')) {
      console.log('✅ El servicio SQL Server (SQLEXPRESS) está ejecutándose');
    } else if (serviceStatus.includes('STOPPED')) {
      console.log('❌ El servicio SQL Server (SQLEXPRESS) está detenido');
      console.log('🔄 Intentando iniciar el servicio...');
      
      try {
        await runCommand('sc start MSSQL$SQLEXPRESS');
        console.log('✅ Servicio iniciado correctamente');
      } catch (error) {
        console.log('❌ No se pudo iniciar el servicio. Intenta iniciarlo manualmente desde Servicios de Windows');
      }
    }
  } catch (error) {
    console.log('⚠️ No se pudo verificar el estado del servicio SQL Server');
  }
  
  // 3. Intentar conexión directa con config hardcodeada
  console.log('\n🔌 Intentando conexión directa a SQL Server...');
  
  try {
    // Carga dinámica de mssql para manejar el caso en que no esté instalado
    let sql;
    try {
      sql = require('mssql');
    } catch (err) {
      console.log('⚠️ Paquete mssql no está instalado. Instalándolo...');
      await runCommand('npm install mssql --save');
      console.log('✅ Paquete mssql instalado correctamente');
      
      // Intentar cargar nuevamente
      try {
        sql = require('mssql');
      } catch (err) {
        console.log('❌ No se pudo cargar el paquete mssql después de instalarlo');
        throw new Error('No se pudo cargar mssql');
      }
    }
    
    // Configuraciones a probar
    const configs = [
      // 1. Configuración básica
      {
        name: "Configuración básica",
        config: {
          user: 'sa',
          password: 'LaSalle2599',
          server: 'localhost',
          database: 'gustados',
          options: {
            encrypt: false,
            trustServerCertificate: true
          }
        }
      },
      // 2. Con nombre de instancia
      {
        name: "Con instancia SQLEXPRESS",
        config: {
          user: 'sa',
          password: 'LaSalle2599',
          server: 'localhost',
          database: 'gustados',
          options: {
            encrypt: false,
            trustServerCertificate: true,
            instanceName: 'SQLEXPRESS'
          }
        }
      },
      // 3. Usando Windows Authentication
      {
        name: "Autenticación de Windows",
        config: {
          server: 'localhost',
          database: 'gustados',
          options: {
            encrypt: false,
            trustServerCertificate: true,
            instanceName: 'SQLEXPRESS',
            trustedConnection: true
          }
        }
      },
      // 4. Puerto específico (suele ser 1433)
      {
        name: "Puerto específico 1433",
        config: {
          user: 'sa',
          password: 'LaSalle2599',
          server: 'localhost',
          port: 1433,
          database: 'gustados',
          options: {
            encrypt: false,
            trustServerCertificate: true
          }
        }
      }
    ];
    
    // Intentar cada configuración
    for (const configOption of configs) {
      console.log(`\n🔄 Probando: ${configOption.name}`);
      try {
        await sql.connect(configOption.config);
        console.log('✅ Conexión exitosa!');
        
        // Intentar ejecutar una consulta
        const result = await sql.query`SELECT @@VERSION as version`;
        console.log('✅ Versión de SQL Server:', result.recordset[0].version);
        
        // Intentar listar tablas
        try {
          const tablesResult = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
          console.log('📋 Tablas encontradas:', tablesResult.recordset.length);
          tablesResult.recordset.forEach(row => {
            console.log(`- ${row.TABLE_NAME}`);
          });
        } catch (err) {
          console.log('⚠️ No se pudieron listar las tablas:', err.message);
        }
        
        // Cerrar la conexión
        await sql.close();
        
        // Actualizar el archivo .env con la configuración exitosa
        if (configOption.name === "Autenticación de Windows") {
          // Para Windows Auth
          const newEnv = `DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql
DB_AUTH=windows
JWT_SECRET=secreto123
PORT=3001
NODE_ENV=development`;
          fs.writeFileSync(envPath, newEnv);
        } else if (configOption.name === "Puerto específico 1433") {
          // Para puerto específico
          const newEnv = `DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=LaSalle2599
DB_NAME=gustados
DB_PORT=1433
DB_DIALECT=mssql
JWT_SECRET=secreto123
PORT=3001
NODE_ENV=development`;
          fs.writeFileSync(envPath, newEnv);
        } else if (configOption.name === "Con instancia SQLEXPRESS") {
          // Config normal con instancia
          const newEnv = `DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=LaSalle2599
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql
JWT_SECRET=secreto123
PORT=3001
NODE_ENV=development`;
          fs.writeFileSync(envPath, newEnv);
        }
        
        console.log('✅ Archivo .env actualizado con la configuración exitosa');
        
        // Crear archivo de configuración de base de datos actualizado
        let newDbConfig = `// backend/config/db.config.js - Actualizado por diagnóstico

require('dotenv').config();

module.exports = {
  dialect: process.env.DB_DIALECT || 'mssql',`;
        
        if (configOption.name === "Autenticación de Windows") {
          newDbConfig += `
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gustados',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
      trustedConnection: true
    }
  },`;
        } else if (configOption.name === "Puerto específico 1433") {
          newDbConfig += `
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gustados',
  port: process.env.DB_PORT || 1433,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },`;
        } else {
          newDbConfig += `
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gustados',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS'
    }
  },`;
        }
        
        newDbConfig += `
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};`;

        const dbConfigPath = path.resolve(__dirname, '../config/db.config.js');
        fs.writeFileSync(dbConfigPath, newDbConfig);
        console.log('✅ Archivo db.config.js actualizado con la configuración exitosa');
        
        // Si llegamos aquí, terminamos el diagnóstico
        console.log('\n🎉 Diagnóstico completado: Configuración exitosa encontrada');
        return;
      } catch (err) {
        console.log('❌ Fallo con esta configuración:', err.message);
        await sql.close().catch(() => {});
      }
    }
    
    console.log('\n❌ No se pudo conectar con ninguna configuración');
    
    // 4. Sugerencias finales
    console.log('\n🔧 Sugerencias para resolver el problema:');
    console.log('1. Verifica que SQL Server Authentication está habilitado (no solo Windows Authentication)');
    console.log('2. Verifica que el usuario "sa" está habilitado y tiene la contraseña correcta');
    console.log('3. Reinicia el servicio SQL Server');
    console.log('4. Intenta crear un nuevo usuario en SQL Server con privilegios adecuados');
    console.log('5. Asegúrate de que la base de datos "gustados" existe');
    console.log('6. Verifica el firewall de Windows si estás usando una conexión remota');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnose().catch(err => {
  console.error('Error general en diagnóstico:', err);
});