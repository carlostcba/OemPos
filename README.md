OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y MSSQL como parte de la arquitectura del proyecto OemStock.

🧭 Etapas del Proyecto

Semana 1-2: Setup del Proyecto

✅ Conexión a MSSQL

✅ Definición de modelos: Product, User, Category, etc.

✅ CRUD de productos funcionando

Semana 3-4: Gestión de Autenticación y Seguridad



Semana 5-6: Ventas y Cupones



Semana 7-8: Reportes y Caja



Semana 9+: Frontend Ionic + Tests



🧱 Arquitectura General

Backend: Node.js + Express

ORM: Sequelize (MSSQL)

Base de Datos: SQL Server 2022

Autenticación: JWT con roles

Frontend (próximo): Ionic Framework

🔗 Relaciones

Product → Category / Subcategory / ProductImage / User

Venta → Productos y métodos de pago

✨ Estado del Proyecto

✅ Conexión a base de datos MSSQL ✅ Estructura modular backend ✅ CRUD de productos con relaciones ✅ Middleware de autenticación y control de roles JWT ✅ Pruebas con Postman exitosas

Próxima etapa: gestión de usuarios y autenticación completa (auth.controller.js, hashing de contraseñas, login/register).

📚 Tecnologías

Node.js

Express.js

Sequelize ORM

SQL Server 2022 (MSSQL)

JWT para autenticación

Postman para pruebas de API

📂 Estructura del Proyecto (backend)

backend/
├── config/
│   └── database.js               # Configuración de Sequelize + MSSQL
├── controllers/
│   ├── product.controller.js     # Lógica de productos
│   └── auth.controller.js        # (Pendiente) Login / Registro
├── middleware/
│   └── authJwt.js                # Verifica JWT y roles
├── models/
│   ├── index.js                  # Asociaciones
│   ├── product.model.js          # Modelo de producto
│   ├── user.model.js             # Modelo de usuario
│   ├── category.model.js         # Modelo de categoría
│   ├── subcategory.model.js      # Modelo de subcategoría
│   └── productImage.model.js     # Imágenes relacionadas
├── routes/
│   └── product.routes.js         # Rutas protegidas
├── app.js
└── server.js

✅ Endpoints Disponibles (requieren token)

GET /api/products

POST /api/products

PUT /api/products/:id

DELETE /api/products/:id

Middleware:

verifyToken: valida JWT

requireRole('admin'): restringe según rol

🌐 Variables de entorno (.env)

DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=...
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
JWT_SECRET=secreto123

⚡ Recomendaciones Siguientes



🚀 Comenzar

cd backend
npm install
node server.js

El backend corre en http://localhost:3001.

🐞 Ejecutar en modo depuración (nodemon)

Para evitar reiniciar manualmente con Ctrl + C, instalá nodemon y usalo así:

npm install -g nodemon
nodemon server.js

O bien, agregalo como script en package.json:

"scripts": {
  "dev": "nodemon server.js"
}

Y ejecutá:

npm run dev

💡 Documentación y colección Postman disponible a pedido.

