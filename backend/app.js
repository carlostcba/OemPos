const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');
const orderRoutes = require('./routes/order.routes'); // ✅ importar las rutas de órdenes
const orderQueueRoutes = require('./routes/orderQueue.routes'); // <<✅ agregado

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rutas API
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes); // ✅ activar rutas de órdenes
app.use('/api/order-queue', orderQueueRoutes); // <<✅ agregado

// Sincronizar modelos con la base de datos
sequelize.sync();

module.exports = app;
