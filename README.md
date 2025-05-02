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

### Semana 7-8: Reportes y Caja ✅ COMPLETADO
- Sistema de caja con apertura, cierre y arqueos
- Reportes de caja con totales por método de pago
- Reportes de inventario implementados
- Reportes de ventas y comprobantes
- Toma de inventario implementada
- Dashboard con estadísticas generales

### Semana 9-10: Optimizaciones y Rendimiento ✅ COMPLETADO
- Sistema de caché implementado para consultas frecuentes
- Transacciones robustas con reintentos automáticos
- Optimización de consultas SQL
- Mejoras en el manejo de errores
- Logging estructurado y formateado
- Middlewares de seguridad y compresión
- Validación de datos y herramientas de diagnóstico

### Semana 11+: Frontend Ionic + Tests ⏳ EN PROGRESO (10%)
- Preparación de API para integración con frontend
- Definición de contratos de integración
- Documentación completa de API endpoints
- Configuración inicial de tests con Jest y Supertest

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

## 🚀 Nuevas mejoras implementadas

### 📈 Sistema de Rendimiento
- **Sistema de caché**: Implementación de caché en memoria para consultas frecuentes con invalidación inteligente por patrones
- **Transacciones robustas**: Manejo de transacciones con reintentos automáticos para operaciones críticas
- **Optimización de consultas**: Uso de consultas SQL nativas para operaciones de alto rendimiento
- **Control de concurrencia**: Manejo de bloqueos y detección de conflictos

### 🛡️ Seguridad y Estabilidad
- **Headers de seguridad**: Protección contra XSS, clickjacking y MIME sniffing
- **Rate limiting**: Limitación de solicitudes para prevenir abusos
- **Compresión de respuestas**: Reducción del tamaño de las respuestas para mayor velocidad
- **Graceful shutdown**: Cierre controlado del servidor con manejo correcto de conexiones
- **Manejo de errores centralizado**: Middleware para captura y formateo de errores

### 📊 Dashboard y Reportes
- **Dashboard completo**: Panel de control con métricas clave del negocio
- **Reportes por categoría**: Análisis de ventas por categoría de productos
- **Tendencias diarias**: Gráficos de ventas diarias con análisis de tendencias
- **Top productos**: Listado de productos más vendidos con estadísticas
- **Análisis de pagos**: Distribución de ventas por método de pago
- **Métricas de inventario**: Control de stock con alertas de productos con bajo stock

### 🧪 Herramientas de Diagnóstico
- **Logging estructurado**: Sistema de logs en formato JSON con niveles y timestamping local
- **Validación de datos**: Scripts para verificar integridad de datos en la base
- **Herramientas de testing**: Configuración de pruebas automatizadas

---

## 🔍 Próximas Implementaciones

| Prioridad | Tarea |
|-----------|-------|
| 🔥 | Desarrollar frontend en Ionic Framework |
| 🔥 | Implementar integración con impresoras térmicas |
| 🔥 | Sistema de envío de comprobantes por email |
| 🛠️ | Implementar tests automatizados |
| 🛠️ | Sistema de backups y restauración |
| 🛠️ | Integración con métodos de pago electrónicos |

---

## 📚 Tecnologías Utilizadas

- Node.js v18+
- Express.js v5.1.0
- Sequelize ORM v6.37.7
- SQL Server 2022
- JWT para autenticación
- bcrypt para cifrado de contraseñas
- Multer para gestión de imágenes
- Helmet para seguridad de cabeceras HTTP
- Node-Cache para sistema de caché en memoria
- Winston para logging avanzado
- Jest + Supertest para pruebas automatizadas

---

## 📂 Estructura del Proyecto

```
backend/
├── config/
│   ├── database.js         # Configuración de Sequelize + MSSQL
│   ├── db.config.js        # Parámetros de conexión a la BD
│   └── config.js           # Configuración por entorno (dev/prod/test)
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
│   ├── inventory.controller.js # Control de inventario
│   └── dashboard.controller.js # Estadísticas y reportes
├── middleware/
│   ├── authJwt.js          # Middlewares de autenticación y permisos
│   ├── validate.js         # Validación de datos
│   ├── rateLimiter.js      # Limitación de solicitudes
│   ├── compression.js      # Compresión de respuestas
│   ├── security.js         # Headers de seguridad
│   └── errorHandler.js     # Manejo centralizado de errores
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
│   ├── inventory.routes.js # Rutas para inventario
│   └── dashboard.routes.js # Rutas para el dashboard
├── sql/                    # Scripts SQL para seed de datos
│   ├── gustados_schema_v3.sql  # Esquema de base de datos
│   ├── insert_categories.sql   # Datos iniciales de categorías
│   ├── insert_products.sql     # Datos iniciales de productos
│   ├── insert_sub_categories.sql # Datos iniciales de subcategorías
│   ├── roles_permisos_seed.sql # Datos iniciales de roles y permisos
│   └── cash_inventory_receipts_tables.sql # Nuevas tablas
├── utils/
│   ├── cache.js            # Sistema de caché
│   ├── logger.js           # Sistema de logging
│   └── transaction.js      # Manejo de transacciones
├── scripts/
│   ├── seed.js             # Sembrado de datos iniciales
│   ├── migrate.js          # Migraciones de base de datos
│   └── validateData.js     # Validación de integridad de datos
├── tests/
│   ├── setup.js            # Configuración de pruebas
│   └── fixtures/           # Datos de prueba
├── logs/                   # Directorio de logs
├── app.js                  # Configuración de Express
└── server.js               # Punto de entrada
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
NODE_ENV=development
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

# Ejecutar validación de datos
npm run validate:data

# Sembrar datos iniciales
npm run db:seed
```

> El backend corre en `http://localhost:3001` por defecto.

---

### 💡 Documentación de API disponible en la [Wiki](https://github.com/carlostcba/oempos/wiki) del proyecto.

---

## 📊 Capturas de Pantalla

(Próximamente)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama con tu característica (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y commits (`git commit -m 'Add amazing feature'`)
4. Sube tu rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.