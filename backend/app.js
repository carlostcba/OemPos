// backend/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsConfig = require('./config/cors');
const logger = require('./utils/logger');
const securityMiddleware = require('./middlewares/security');
const compressionMiddleware = require('./middlewares/compression');
const errorHandler = require('./middlewares/errorHandler');

// Rutas
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const subcategoryRoutes = require('./routes/subcategory.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');
const orderRoutes = require('./routes/order.routes');
const orderQueueRoutes = require('./routes/orderQueue.routes');
const couponRoutes = require('./routes/coupon.routes');
const cashRegisterRoutes = require('./routes/cashRegister.routes');
const receiptRoutes = require('./routes/receipt.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Logging de solicitudes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

try {
  // Endpoints API
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/subcategories', subcategoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/images', imageRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/order-queue', orderQueueRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/cash-register', cashRegisterRoutes);
  app.use('/api/receipts', receiptRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/audit', auditRoutes);
} catch (e) {
  console.error('🔥 ERROR cargando rutas:');
  console.error(e.message);
  console.trace(e);
  process.exit(1);
}

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo centralizado de errores
app.use(errorHandler);

module.exports = app;