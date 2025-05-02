# OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y SQL Server como parte de la arquitectura del proyecto OemPos.

---

## 🛍️ Estado Actual del Proyecto

### Semana 1-2: Setup del Proyecto ✅ COMPLETADO
- Base de datos SQL Server conectada mediante Sequelize
- Modelos implementados: Product, Category, Subcategory, ProductImage, User, Role, Permission
- Sistema de relaciones entre entidades configurado
- CRUD de productos completo y funcional

### Semana 3-4: Autenticación y Seguridad ✅ COMPLETADO
- Login y registro de usuarios implementado
- Autenticación JWT funcionando correctamente
- Middleware `verifyToken` activo en todas las rutas
- Sistema de roles y permisos implementado
- Middlewares `requirePermission` y `requireRole` operativos

### Semana 5-6: Ventas y Cupones ✅ COMPLETADO
- CRUD de Orders, OrderItems, OrderQueue completo
- Sistema de códigos automáticos (O001, P001, D001, S001) implementado
- Gestión de cupones y descuentos funcionando
- Implementada lógica para aplicar cupones según método de pago
- Cola de atención con priorización implementada
- Sistema de caja implementado con apertura/cierre
- Comprobantes de venta generados automáticamente
- Control de inventario integrado con ventas

### Semana 7-8: Reportes y Caja ⏳ EN PROGRESO (80%)
- Sistema de caja con apertura, cierre y arqueos
- Reportes de caja con totales por método de pago
- Reportes de inventario
- Reportes de ventas y comprobantes
- Toma de inventario implementada
- Pendiente: Dashboard con estadísticas generales

### Semana 9+: Frontend Ionic + Tests ❌ NO INICIADO

---

## 🔁 Modelo de Negocio y Flujo de Trabajo

### 🧩 Modelo de Negocio
- **Tipo**: Venta minorista presencial
- **Canal**: Punto de orden (vendedor) + Punto de caja (cajero)
- **Clientes**: ORDEN (inmediato) / PEDIDO (programado) / DELIVERY (a domicilio) / SALON (consumo en local)
- **Medios de Pago**: Efectivo, Tarjeta, Transferencia
- **Valor Agregado**: Descuentos especiales en efectivo, pedidos programables
- **Sistema**: Transacciones, cupones, comprobantes, estadísticas

---

### 🔄 Flujo de Trabajo Implementado

#### 👤 VENDEDOR (Punto de Orden)
1. Recibe al cliente
2. Registra tipo de transacción: ORDEN, PEDIDO, DELIVERY o SALON
3. Recopila datos según tipo de operación
4. Agrega productos al pedido
5. Sistema genera código único automático (Ej: O001, P001)
6. Registra medio de pago tentativo
7. Envía transacción a la cola de atención

#### 💵 CAJERO (Punto de Caja)
1. Abre caja al iniciar turno
2. Gestiona cola de atención con priorización
3. Llama al siguiente cliente según prioridad
4. Confirma o modifica método de pago
5. Procesa cobro y aplica cupones si corresponde
6. Registra pagos completos o señas para pedidos
7. Genera comprobante de venta
8. Actualiza inventario automáticamente
9. Cierra caja al finalizar turno

---

## 🔐 Sistema de Roles y Permisos

### Roles Principales
- **VENDEDOR**: carga pedidos
- **CAJERO**: procesa pagos
- **SUPERVISOR**: audita operaciones
- **ADMINISTRADOR**: gestión completa del sistema

### Permisos Implementados

#### 📦 Transacciones
- ver_productos
- crear_producto
- modificar_producto
- eliminar_producto
- ver_ordenes
- crear_orden
- modificar_orden
- eliminar_orden
- gestionar_cola
- ver_inventario
- gestionar_inventario

#### 🧾 Pagos y Cupones
- procesar_pagos
- ver_cupones
- aplicar_cupones
- gestionar_imagenes
- ver_comprobantes
- anular_comprobantes

#### 📊 Reportes y Caja
- ver_reportes
- ver_caja
- abrir_caja
- cerrar_caja
- ver_historial_caja

#### ⚙️ Administración
- ver_usuarios
- gestionar_usuarios
- configurar_parametros

---

## 🧱 Arquitectura del Sistema

- **Backend:** Node.js + Express
- **ORM:** Sequelize
- **Base de Datos:** SQL Server 2022
- **Autenticación:** JWT con sistema de roles y permisos
- **Frontend (próximo):** Ionic Framework

### 🔗 Estructura de Relaciones
- User → Role → Permissions (relación muchos a muchos)
- Product → Category / Subcategory / ProductImage / User
- Order → OrderItems → Products
- Order → OrderQueue para gestión de cola
- Order → Receipt para comprobantes
- CashRegister → CashTransaction para movimientos de caja
- Product → InventoryMovement para control de stock

---

## 📊 Modelos implementados

- **Products**: Productos con categorías, subcategorías e imágenes
- **Orders**: Pedidos con múltiples tipos (orden, pedido, delivery, salon)
- **OrderItems**: Líneas de productos en cada pedido
- **OrderQueue**: Sistema de cola para atención de clientes
- **Coupons**: Sistema de cupones con múltiples reglas
- **Users**: Usuarios con roles y permisos
- **Roles/Permissions**: Sistema modular de permisos
- **CashRegister**: Control de cajas con apertura y cierre
- **CashTransaction**: Movimientos de dinero en caja
- **Receipt**: Comprobantes de venta
- **InventoryMovement**: Control de stock y movimientos

---

## 🔍 Próximas Implementaciones

| Prioridad | Tarea |
|-----------|-------|
| 🔥 | Implementar dashboard con estadísticas generales |
| 🔥 | Desarrollar informes para toma de decisiones |
| 🔥 | Sistema de alertas para stock bajo |
| 🛠️ | Desarrollar frontend en Ionic |

---

## 📚 Tecnologías Utilizadas

- Node.js v18+
- Express.js v5.1.0
- Sequelize ORM v6.37.7
- SQL Server 2022
- JWT para autenticación
- bcrypt para cifrado de contraseñas
- Multer para gestión de imágenes

---

## 📂 Estructura del Proyecto

```
backend/
├── config/
│   ├── database.js         # Configuración de Sequelize + MSSQL
│   └── db.config.js        # Parámetros de conexión a la BD
├── controllers/
│   ├── auth.controller.js  # Autenticación y registro
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── coupon.controller.js
│   ├── image.controller.js
│   ├── orderQueue.controller.js
│   ├── user.controller.js  # Gestión de usuarios
│   ├── cashRegister.controller.js # Gestión de caja
│   ├── receipt.controller.js # Comprobantes
│   └── inventory.controller.js # Control de inventario
├── middleware/
│   └── authJwt.js          # Middlewares de autenticación y permisos
├── models/
│   ├── index.js            # Asociaciones entre modelos
│   ├── product.model.js
│   ├── order.model.js
│   ├── orderItem.model.js
│   ├── orderQueue.model.js
│   ├── user.model.js
│   ├── role.model.js
│   ├── permission.model.js
│   ├── category.model.js   # Categorías de productos
│   ├── subcategory.model.js # Subcategorías de productos
│   ├── productImage.model.js # Imágenes de productos
│   ├── coupon.model.js     # Cupones de descuento
│   ├── cashRegister.model.js # Cajas registradoras
│   ├── cashTransaction.model.js # Transacciones en caja
│   ├── receipt.model.js    # Comprobantes
│   └── inventory.model.js  # Movimientos de inventario
├── routes/
│   ├── product.routes.js
│   ├── auth.routes.js
│   ├── order.routes.js
│   ├── coupon.routes.js
│   ├── orderQueue.routes.js
│   ├── image.routes.js     # Rutas para gestión de imágenes
│   ├── user.routes.js      # Rutas para gestión de usuarios
│   ├── cashRegister.routes.js # Rutas para gestión de caja
│   ├── receipt.routes.js   # Rutas para comprobantes
│   └── inventory.routes.js # Rutas para inventario
├── sql/                    # Scripts SQL para seed de datos
│   ├── gustados_schema_v3.sql  # Esquema de base de datos
│   ├── insert_categories.sql   # Datos iniciales de categorías
│   ├── insert_products.sql     # Datos iniciales de productos
│   ├── insert_sub_categories.sql # Datos iniciales de subcategorías
│   ├── roles_permisos_seed.sql # Datos iniciales de roles y permisos
│   └── cash_inventory_receipts_tables.sql # Nuevas tablas
├── app.js                  # Configuración de Express
└── server.js              # Punto de entrada
```

---

## 🔐 Variables de entorno (.env)

```
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=tu_password
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql
JWT_SECRET=tu_secreto
PORT=3001
```

---

## 🚀 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/oempos.git

# Instalar dependencias
cd oempos/backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en modo desarrollo
npm run dev

# O iniciar en modo producción
npm start
```

> El backend corre en `http://localhost:3001` por defecto.

---

### 💡 Documentación de API disponible via Postman a solicitud.