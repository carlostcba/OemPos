// backend/app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

// Rutas
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');
const orderRoutes = require('./routes/order.routes');
const orderQueueRoutes = require('./routes/orderQueue.routes');
const couponRoutes = require('./routes/coupon.routes');
const cashRegisterRoutes = require('./routes/cashRegister.routes');
const receiptRoutes = require('./routes/receipt.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const dashboardRoutes = require('./routes/dashboard.routes'); // Nueva ruta

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Endpoints
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-queue', orderQueueRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes); // Nuevo endpoint

sequelize.sync(); // crea las tablas si no existen

module.exports = app;