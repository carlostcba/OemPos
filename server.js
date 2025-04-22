require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MSSQL exitosa');

    // Sincroniza modelos. En desarrollo podés usar { alter: true } o { force: true }
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
}

startServer();
