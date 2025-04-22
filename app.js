const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);

sequelize.sync(); // crea las tablas si no existen

module.exports = app;
