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


# OemPOS API Documentation

## Índice

1. [Autenticación](#autenticación)
2. [Productos](#productos)
3. [Categorías y Subcategorías](#categorías-y-subcategorías)
4. [Imágenes](#imágenes)
5. [Órdenes](#órdenes)
6. [Cola de Atención](#cola-de-atención)
7. [Cupones](#cupones)
8. [Cajas Registradoras](#cajas-registradoras)
9. [Comprobantes](#comprobantes)
10. [Inventario](#inventario)
11. [Usuarios](#usuarios)

## Autenticación

Base URL: `/api/auth`

### Iniciar sesión

Permite a un usuario autenticarse y recibir un token JWT.

**Método:** `POST`  
**Endpoint:** `/login`  
**Auth requerida:** No

**Cuerpo de la solicitud:**
```json
{
  "username": "usuario",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Registrar usuario

Registra un nuevo usuario en el sistema.

**Método:** `POST`  
**Endpoint:** `/register`  
**Auth requerida:** No

**Cuerpo de la solicitud:**
```json
{
  "username": "nuevo_usuario",
  "password": "contraseña",
  "role": "UUID_DEL_ROL"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "username": "nuevo_usuario"
}
```

### Verificar token

Verifica si un token JWT es válido.

**Método:** `GET`  
**Endpoint:** `/verify-token`  
**Auth requerida:** Sí (Bearer Token)

**Respuesta exitosa:**
```json
{
  "valid": true,
  "user": {
    "id": "UUID",
    "username": "usuario",
    "roles": ["admin"],
    "permissions": ["ver_productos", "crear_producto", ...]
  }
}
```

## Productos

Base URL: `/api/products`

### Obtener todos los productos

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_productos`

**Parámetros de consulta:**
- `category_id` (opcional): Filtrar por categoría
- `subcategory_id` (opcional): Filtrar por subcategoría
- `active` (opcional): Filtrar por estado (true/false)

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "name": "Nombre del producto",
    "plu_code": "0001",
    "price": 29000.00,
    "is_weighable": false,
    "unit_label": "unidad",
    "stock": 10,
    "track_stock": true,
    "allow_discount": true,
    "is_active": true,
    "description": "Descripción del producto",
    "category": {
      "id": "UUID",
      "name": "Nombre de categoría"
    },
    "subcategory": {
      "id": "UUID",
      "name": "Nombre de subcategoría"
    },
    "image": {
      "id": "UUID"
    },
    "creator": {
      "id": "UUID",
      "username": "admin"
    }
  },
  // Más productos...
]
```

### Crear producto

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `crear_producto`

**Cuerpo de la solicitud:**
```json
{
  "name": "Nuevo producto",
  "plu_code": "1234",
  "price": 10000.00,
  "is_weighable": false,
  "unit_label": "unidad",
  "stock": 50,
  "track_stock": true,
  "allow_discount": true,
  "is_active": true,
  "description": "Descripción del nuevo producto",
  "category_id": "UUID_CATEGORIA",
  "subcategory_id": "UUID_SUBCATEGORIA",
  "product_image_id": "UUID_IMAGEN",
  "created_by": "UUID_USUARIO"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "name": "Nuevo producto",
  "plu_code": "1234",
  "price": 10000.00,
  // Resto de los campos...
}
```

### Actualizar producto

**Método:** `PUT`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `modificar_producto`

**Cuerpo de la solicitud:**
```json
{
  "name": "Nombre actualizado",
  "price": 12000.00,
  // Campos a actualizar...
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "name": "Nombre actualizado",
  "price": 12000.00,
  // Resto de los campos...
}
```

### Eliminar producto

**Método:** `DELETE`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `eliminar_producto`

**Respuesta exitosa:**
```json
{
  "message": "Producto eliminado exitosamente"
}
```

## Categorías y Subcategorías

La API de categorías y subcategorías no está detallada en el código proporcionado, pero su estructura sería similar a la de productos.

## Imágenes

Base URL: `/api/images`

### Subir imagen

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_imagenes`  
**Formato:** `multipart/form-data`

**Cuerpo de la solicitud:**
- Campo `file`: Archivo de imagen

**Respuesta exitosa:**
```json
{
  "id": "UUID"
}
```

### Eliminar imagen

**Método:** `DELETE`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_imagenes`

**Respuesta exitosa:**
```json
{
  "message": "Imagen UUID eliminada exitosamente"
}
```

## Órdenes

Base URL: `/api/orders`

### Obtener todas las órdenes

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_ordenes`

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "order_code": "O001",
    "type": "orden",
    "status": "pendiente",
    "customer_name": "Juan Pérez",
    "total_amount": 35000.00,
    // Otros campos...
  },
  // Más órdenes...
]
```

### Obtener una orden específica

**Método:** `GET`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_ordenes`

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "order_code": "O001",
  "type": "orden",
  "status": "pendiente",
  "customer_name": "Juan Pérez",
  "total_amount": 35000.00,
  // Otros campos...
  "items": [
    {
      "id": "UUID",
      "product_id": "UUID_PRODUCTO",
      "product_name": "Nombre del producto",
      "quantity": 2,
      "unit_price": 15000.00,
      "final_price": 30000.00,
      // Otros campos...
    },
    // Más items...
  ]
}
```

### Crear orden

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `crear_orden`

**Cuerpo de la solicitud:**
```json
{
  "type": "orden",
  "customer_name": "Juan Pérez",
  "customer_phone": "123456789",
  "customer_email": "juan@example.com",
  "total_amount": 35000.00,
  "payment_method": "efectivo",
  "created_by": "UUID_USUARIO",
  "items": [
    {
      "product_id": "UUID_PRODUCTO",
      "product_name": "Nombre del producto",
      "quantity": 2,
      "unit_price": 15000.00,
      "final_price": 30000.00,
      "unit_label": "unidad"
    },
    // Más items...
  ]
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "order_code": "O001",
  "type": "orden",
  // Resto de campos...
}
```

### Actualizar orden

**Método:** `PUT`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `modificar_orden`

**Cuerpo de la solicitud:**
```json
{
  "status": "confirmado",
  // Campos a actualizar...
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "status": "confirmado",
  // Resto de campos actualizados...
}
```

### Eliminar orden

**Método:** `DELETE`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `eliminar_orden`

**Respuesta exitosa:**
```json
{
  "message": "Orden eliminada correctamente"
}
```

### Aplicar cupón a una orden

**Método:** `POST`  
**Endpoint:** `/:id/apply-coupon`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `aplicar_cupones`

**Cuerpo de la solicitud:**
```json
{
  "coupon_code": "DESCUENTO10",
  "payment_method": "efectivo"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "order_code": "O001",
  "coupon_code": "DESCUENTO10",
  "discount_amount": 3500.00,
  "total_amount_with_discount": 31500.00,
  // Resto de campos...
}
```

## Cola de Atención

Base URL: `/api/order-queue`

### Obtener toda la cola

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_orden`

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "order_id": "UUID_ORDEN",
    "priority": 1,
    "queue_position": 1,
    "status": "waiting",
    "called_at": null,
    "processed_at": null,
    "created_at": "2025-05-02T12:00:00Z"
  },
  // Más entradas en la cola...
]
```

### Crear entrada en la cola

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `crear_orden`

**Cuerpo de la solicitud:**
```json
{
  "order_id": "UUID_ORDEN",
  "priority": 0
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "order_id": "UUID_ORDEN",
  "priority": 0,
  "queue_position": 2,
  "status": "waiting",
  "created_at": "2025-05-02T12:15:00Z"
}
```

### Actualizar entrada en la cola

**Método:** `PUT`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `modificar_orden`

**Cuerpo de la solicitud:**
```json
{
  "priority": 2,
  "status": "called"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "priority": 2,
  "status": "called",
  // Resto de campos...
}
```

### Eliminar entrada de la cola

**Método:** `DELETE`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `eliminar_orden`

**Respuesta exitosa:**
```json
{
  "message": "Entrada eliminada correctamente"
}
```

### Llamar al siguiente cliente

**Método:** `POST`  
**Endpoint:** `/call-next`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `procesar_pagos`

**Respuesta exitosa:**
```json
{
  "queueEntry": {
    "id": "UUID",
    "order_id": "UUID_ORDEN",
    "status": "called",
    "called_at": "2025-05-02T12:20:00Z",
    // Resto de campos...
  },
  "order": {
    "id": "UUID_ORDEN",
    "order_code": "O001",
    // Información completa de la orden...
    "items": [
      // Detalles de los items...
    ]
  }
}
```

### Marcar como procesada

**Método:** `POST`  
**Endpoint:** `/:id/process`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `procesar_pagos`

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "status": "processed",
  "processed_at": "2025-05-02T12:25:00Z",
  // Resto de campos...
}
```

### Reordenar cola

**Método:** `POST`  
**Endpoint:** `/reorder`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_cola`

**Cuerpo de la solicitud:**
```json
{
  "entries": [
    {"id": "UUID1"},
    {"id": "UUID2"},
    {"id": "UUID3"}
  ]
}
```

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID1",
    "queue_position": 1,
    // Resto de campos...
  },
  {
    "id": "UUID2",
    "queue_position": 2,
    // Resto de campos...
  },
  {
    "id": "UUID3",
    "queue_position": 3,
    // Resto de campos...
  }
]
```

## Cupones

Base URL: `/api/coupons`

### Obtener todos los cupones

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "code": "DESCUENTO10",
    "description": "10% de descuento en toda la tienda",
    "discount_type": "percentage",
    "discount_value": 10.00,
    "min_purchase_amount": 5000.00,
    "is_active": true,
    "valid_from": "2025-01-01T00:00:00Z",
    "valid_to": "2025-12-31T23:59:59Z",
    // Otros campos...
  },
  // Más cupones...
]
```

### Obtener cupón por código

**Método:** `GET`  
**Endpoint:** `/code/:code`  
**Auth requerida:** Sí (Bearer Token)

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "code": "DESCUENTO10",
  "description": "10% de descuento en toda la tienda",
  "discount_type": "percentage",
  "discount_value": 10.00,
  // Otros campos...
}
```

### Verificar cupón

**Método:** `POST`  
**Endpoint:** `/verify`  
**Auth requerida:** Sí (Bearer Token)

**Cuerpo de la solicitud:**
```json
{
  "code": "DESCUENTO10",
  "total_amount": 50000.00
}
```

**Respuesta exitosa:**
```json
{
  "valid": true,
  "coupon": {
    "id": "UUID",
    "code": "DESCUENTO10",
    // Detalles del cupón...
  },
  "discountAmount": 5000.00
}
```

### Incrementar uso de cupón

**Método:** `POST`  
**Endpoint:** `/increment-usage/:code`  
**Auth requerida:** Sí (Bearer Token)

**Respuesta exitosa:**
```json
{
  "success": true
}
```

### Calcular descuento

**Método:** `POST`  
**Endpoint:** `/calculate`  
**Auth requerida:** Sí (Bearer Token)

**Cuerpo de la solicitud:**
```json
{
  "couponCode": "DESCUENTO10",
  "totalAmount": 50000.00,
  "paymentMethod": "efectivo",
  "items": [
    // Detalles de los items...
  ]
}
```

**Respuesta exitosa:**
```json
{
  "couponCode": "DESCUENTO10",
  "originalAmount": 50000.00,
  "applicableAmount": 50000.00,
  "discountAmount": 5000.00,
  "finalAmount": 45000.00
}
```

### Crear cupón

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `admin`

**Cuerpo de la solicitud:**
```json
{
  "code": "NUEVO20",
  "description": "20% de descuento en toda la tienda",
  "discount_type": "percentage",
  "discount_value": 20.00,
  "min_purchase_amount": 10000.00,
  "is_active": true,
  "valid_from": "2025-05-01T00:00:00Z",
  "valid_to": "2025-05-31T23:59:59Z",
  "created_by": "UUID_USUARIO"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "code": "NUEVO20",
  // Resto de campos...
}
```

### Actualizar cupón

**Método:** `PUT`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `admin`

**Cuerpo de la solicitud:**
```json
{
  "is_active": false,
  // Campos a actualizar...
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "is_active": false,
  // Resto de campos...
}
```

### Eliminar cupón

**Método:** `DELETE`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `admin`

**Respuesta exitosa:**
```json
{
  "message": "Cupón eliminado exitosamente"
}
```

## Cajas Registradoras

Base URL: `/api/cash-register`

### Abrir caja

**Método:** `POST`  
**Endpoint:** `/open`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `abrir_caja`

**Cuerpo de la solicitud:**
```json
{
  "opening_amount": 50000.00,
  "opening_notes": "Apertura de caja turno mañana"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "opening_amount": 50000.00,
  "status": "open",
  "opened_at": "2025-05-02T08:00:00Z",
  "opening_notes": "Apertura de caja turno mañana",
  // Otros campos...
}
```

### Cerrar caja

**Método:** `PUT`  
**Endpoint:** `/:id/close`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `cerrar_caja`

**Cuerpo de la solicitud:**
```json
{
  "closing_amount": 150000.00,
  "closing_notes": "Cierre de caja turno mañana"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "opening_amount": 50000.00,
  "closing_amount": 150000.00,
  "expected_amount": 150500.00,
  "difference_amount": -500.00,
  "status": "closed",
  "opened_at": "2025-05-02T08:00:00Z",
  "closed_at": "2025-05-02T14:00:00Z",
  "opening_notes": "Apertura de caja turno mañana",
  "closing_notes": "Cierre de caja turno mañana",
  "opener": {
    "id": "UUID",
    "username": "usuario1"
  },
  "closer": {
    "id": "UUID",
    "username": "usuario1"
  }
}
```

### Obtener todas las cajas

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_historial_caja`

**Parámetros de consulta:**
- `status` (opcional): Filtrar por estado ('open', 'closed')
- `startDate` (opcional): Fecha de inicio (formato ISO)
- `endDate` (opcional): Fecha de fin (formato ISO)

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "opening_amount": 50000.00,
    "status": "closed",
    // Resto de campos...
    "opener": {
      "id": "UUID",
      "username": "usuario1"
    },
    "closer": {
      "id": "UUID",
      "username": "usuario1"
    }
  },
  // Más cajas...
]
```

### Obtener caja actual del usuario

**Método:** `GET`  
**Endpoint:** `/current`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_caja`

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "opening_amount": 50000.00,
  "status": "open",
  "opened_at": "2025-05-02T08:00:00Z",
  // Otros campos...
  "transactions": [
    // Transacciones asociadas...
  ],
  "current_balance": 75000.00
}
```

### Obtener caja por ID

**Método:** `GET`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_historial_caja`

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "opening_amount": 50000.00,
  // Campos de la caja...
  "opener": {
    "id": "UUID",
    "username": "usuario1"
  },
  "closer": {
    "id": "UUID",
    "username": "usuario1"
  },
  "transactions": [
    // Transacciones asociadas...
  ],
  "orders": [
    // Órdenes asociadas...
  ]
}
```

### Registrar transacción

**Método:** `POST`  
**Endpoint:** `/transaction`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `procesar_pagos`

**Cuerpo de la solicitud:**
```json
{
  "cash_register_id": "UUID_CAJA",
  "order_id": "UUID_ORDEN",
  "type": "income",
  "amount": 35000.00,
  "payment_method": "efectivo",
  "description": "Pago de orden O001",
  "reference": "O001"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "cash_register_id": "UUID_CAJA",
  "order_id": "UUID_ORDEN",
  "type": "income",
  "amount": 35000.00,
  "payment_method": "efectivo",
  "description": "Pago de orden O001",
  "reference": "O001",
  "created_at": "2025-05-02T10:15:00Z",
  "creator": {
    "id": "UUID",
    "username": "usuario1"
  },
  "order": {
    "id": "UUID_ORDEN",
    "order_code": "O001",
    "total_amount": 35000.00
  }
}
```

### Generar reporte de caja

**Método:** `GET`  
**Endpoint:** `/:id/report`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_reportes`

**Respuesta exitosa:**
```json
{
  "cash_register": {
    "id": "UUID",
    "opened_by": "usuario1",
    "closed_by": "usuario1",
    "opened_at": "2025-05-02T08:00:00Z",
    "closed_at": "2025-05-02T14:00:00Z",
    "status": "closed",
    "opening_amount": 50000.00,
    "closing_amount": 150000.00,
    "expected_amount": 150500.00,
    "difference_amount": -500.00
  },
  "totals": {
    "cash": {
      "income": 95000.00,
      "expense": 5000.00,
      "deposit": 10000.00,
      "withdrawal": 0.00,
      "adjustment": 0.00
    },
    "card": {
      "income": 25000.00,
      "expense": 0.00
    },
    "transfer": {
      "income": 15000.00,
      "expense": 0.00
    },
    "other": {
      "income": 0.00,
      "expense": 0.00
    },
    "total": {
      "income": 145000.00,
      "expense": 5000.00,
      "balance": 140000.00
    }
  },
  "order_count": 10,
  "transaction_count": 12,
  "generated_at": "2025-05-02T15:00:00Z"
}
```

## Comprobantes

Base URL: `/api/receipts`

### Generar comprobante

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `procesar_pagos`

**Cuerpo de la solicitud:**
```json
{
  "order_id": "UUID_ORDEN",
  "payment_method": "efectivo",
  "is_partial": false,
  "notes": "Pago completo"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "order_id": "UUID_ORDEN",
  "receipt_number": "20250502-0001",
  "total_amount": 35000.00,
  "payment_method": "efectivo",
  "is_partial": false,
  "customer_name": "Juan Pérez",
  "issued_at": "2025-05-02T10:20:00Z",
  "notes": "Pago completo",
  "is_voided": false,
  "issuer": {
    "id": "UUID",
    "username": "usuario1"
  },
  "order": {
    "id": "UUID_ORDEN",
    "order_code": "O001",
    // Detalles de la orden...
    "items": [
      // Detalles de los items...
    ]
  }
}
```

### Obtener todos los comprobantes

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_comprobantes`

**Parámetros de consulta:**
- `startDate` (opcional): Fecha de inicio (formato ISO)
- `endDate` (opcional): Fecha de fin (formato ISO)
- `order_id` (opcional): Filtrar por orden

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "receipt_number": "20250502-0001",
    "total_amount": 35000.00,
    "payment_method": "efectivo",
    "is_partial": false,
    "is_voided": false,
    "issued_at": "2025-05-02T10:20:00Z",
    "issuer": {
      "id": "UUID",
      "username": "usuario1"
    },
    "order": {
      "id": "UUID_ORDEN",
      "order_code": "O001",
      "type": "orden",
      "customer_name": "Juan Pérez",
      "total_amount": 35000.00
    }
  },
  // Más comprobantes...
]
```

### Obtener comprobante por ID

**Método:** `GET`  
**Endpoint:** `/:id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_comprobantes`

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "receipt_number": "20250502-0001",
  "total_amount": 35000.00,
  "payment_method": "efectivo",
  "is_partial": false,
  "customer_name": "Juan Pérez",
  "issued_at": "2025-05-02T10:20:00Z",
  "notes": "Pago completo",
  "is_voided": false,
  "issuer": {
    "id": "UUID",
    "username": "usuario1"
  },
  "voider": null,
  "order": {
    "id": "UUID_ORDEN",
    "order_code": "O001",
    "items": [
      // Detalles de los items...
    ]
  }
}
```

### Anular comprobante

**Método:** `PUT`  
**Endpoint:** `/:id/void`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `anular_comprobantes`

**Cuerpo de la solicitud:**
```json
{
  "reason": "Error en el monto cobrado"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "receipt_number": "20250502-0001",
  "is_voided": true,
  "voided_at": "2025-05-02T11:30:00Z",
  "voided_reason": "Error en el monto cobrado",
  "voider": {
    "id": "UUID",
    "username": "admin"
  },
  // Resto de campos...
}
```

### Generar reporte de comprobantes

**Método:** `GET`  
**Endpoint:** `/report`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_reportes`

**Parámetros de consulta:**
- `startDate`: Fecha de inicio (formato ISO)
- `endDate`: Fecha de fin (formato ISO)

**Respuesta exitosa:**
```json
{
  "period": {
    "start_date": "2025-05-01T00:00:00Z",
    "end_date": "2025-05-02T23:59:59Z"
  },
  "stats": {
    "total_count": 25,
    "total_amount": 750000.00,
    "by_payment_method": {
      "efectivo": { "count": 15, "amount": 450000.00 },
      "tarjeta": { "count": 8, "amount": 240000.00 },
      "transferencia": { "count": 2, "amount": 60000.00 },
      "mixto": { "count": 0, "amount": 0.00 },
      "otros": { "count": 0, "amount": 0.00 }
    },
    "by_order_type": {
      "orden": { "count": 18, "amount": 540000.00 },
      "pedido": { "count": 5, "amount": 150000.00 },
      "delivery": { "count": 2, "amount": 60000.00 },
      "salon": { "count": 0, "amount": 0.00 }
    },
    "by_date": {
      "2025-05-01": { "count": 12, "amount": 360000.00 },
      "2025-05-02": { "count": 13, "amount": 390000.00 }
    }
  },
  "generated_at": "2025-05-03T09:00:00Z"
}
```

## Inventario

Base URL: `/api/inventory`

### Registrar movimiento de inventario

**Método:** `POST`  
**Endpoint:** `/movement`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_inventario`

**Cuerpo de la solicitud:**
```json
{
  "product_id": "UUID_PRODUCTO",
  "order_id": "UUID_ORDEN",
  "movement_type": "sale",
  "quantity": 2,
  "notes": "Venta en orden O001"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "product_id": "UUID_PRODUCTO",
  "order_id": "UUID_ORDEN",
  "movement_type": "sale",
  "quantity": 2,
  "previous_stock": 10,
  "new_stock": 8,
  "notes": "Venta en orden O001",
  "created_at": "2025-05-02T10:25:00Z",
  "product": {
    "id": "UUID_PRODUCTO",
    "name": "Nombre del producto",
    // Detalles del producto...
  },
  "creator": {
    "id": "UUID",
    "username": "usuario1"
  },
  "order": {
    "id": "UUID_ORDEN",
    "order_code": "O001",
    "type": "orden"
  }
}
```

### Obtener movimientos de un producto

**Método:** `GET`  
**Endpoint:** `/product/:product_id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_inventario`

**Parámetros de consulta:**
- `startDate` (opcional): Fecha de inicio (formato ISO)
- `endDate` (opcional): Fecha de fin (formato ISO)

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "product_id": "UUID_PRODUCTO",
    "order_id": "UUID_ORDEN",
    "movement_type": "sale",
    "quantity": 2,
    "previous_stock": 10,
    "new_stock": 8,
    "notes": "Venta en orden O001",
    "created_at": "2025-05-02T10:25:00Z",
    "creator": {
      "id": "UUID",
      "username": "usuario1"
    },
    "order": {
      "id": "UUID_ORDEN",
      "order_code": "O001",
      "type": "orden"
    }
  },
  // Más movimientos...
]
```

### Actualizar inventario desde orden

**Método:** `POST`  
**Endpoint:** `/order/:order_id`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `procesar_pagos`

**Respuesta exitosa:**
```json
{
  "order_id": "UUID_ORDEN",
  "order_code": "O001",
  "updated_items": 3,
  "results": [
    {
      "product_id": "UUID_PRODUCTO1",
      "product_name": "Producto 1",
      "previous_stock": 10,
      "quantity": 2,
      "new_stock": 8,
      "movement_id": "UUID_MOVIMIENTO1"
    },
    {
      "product_id": "UUID_PRODUCTO2",
      "product_name": "Producto 2",
      "previous_stock": 15,
      "quantity": 1,
      "new_stock": 14,
      "movement_id": "UUID_MOVIMIENTO2"
    },
    {
      "product_id": "UUID_PRODUCTO3",
      "product_name": "Producto 3",
      "previous_stock": 20,
      "quantity": 3,
      "new_stock": 17,
      "movement_id": "UUID_MOVIMIENTO3"
    }
  ]
}
```

### Realizar toma de inventario

**Método:** `POST`  
**Endpoint:** `/stocktake`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_inventario`

**Cuerpo de la solicitud:**
```json
{
  "items": [
    {
      "product_id": "UUID_PRODUCTO1",
      "actual_stock": 8
    },
    {
      "product_id": "UUID_PRODUCTO2",
      "actual_stock": 15
    },
    {
      "product_id": "UUID_PRODUCTO3",
      "actual_stock": 25
    }
  ],
  "notes": "Toma de inventario mensual"
}
```

**Respuesta exitosa:**
```json
{
  "date": "2025-05-02T16:00:00Z",
  "total_items": 3,
  "notes": "Toma de inventario mensual",
  "results": [
    {
      "product_id": "UUID_PRODUCTO1",
      "product_name": "Producto 1",
      "previous_stock": 8,
      "actual_stock": 8,
      "difference": 0,
      "movement_id": "UUID_MOVIMIENTO1"
    },
    {
      "product_id": "UUID_PRODUCTO2",
      "product_name": "Producto 2",
      "previous_stock": 14,
      "actual_stock": 15,
      "difference": 1,
      "movement_id": "UUID_MOVIMIENTO2"
    },
    {
      "product_id": "UUID_PRODUCTO3",
      "product_name": "Producto 3",
      "previous_stock": 17,
      "actual_stock": 25,
      "difference": 8,
      "movement_id": "UUID_MOVIMIENTO3"
    }
  ]
}
```

### Generar reporte de inventario

**Método:** `GET`  
**Endpoint:** `/report`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_reportes`

**Parámetros de consulta:**
- `category_id` (opcional): Filtrar por categoría
- `low_stock` (opcional): Mostrar productos con stock bajo ('true'/'false')
- `inactive` (opcional): Filtrar por estado ('true'/'false')

**Respuesta exitosa:**
```json
{
  "date": "2025-05-02T17:00:00Z",
  "filter": {
    "category_id": "all",
    "low_stock": true,
    "inactive": null
  },
  "stats": {
    "total_count": 50,
    "active_count": 45,
    "inactive_count": 5,
    "low_stock_count": 8,
    "zero_stock_count": 2,
    "tracked_count": 40,
    "not_tracked_count": 10,
    "total_stock_value": 2500000.00
  },
  "products": [
    {
      "id": "UUID_PRODUCTO1",
      "name": "Producto 1",
      "plu_code": "0001",
      "price": 29000.00,
      "is_active": true,
      "track_stock": true,
      "stock": 3,
      "stock_value": 87000.00,
      "is_low_stock": true,
      "is_out_of_stock": false,
      "category": "Categoría 1",
      "subcategory": "Subcategoría 1"
    },
    // Más productos...
  ]
}
```

## Usuarios

Base URL: `/api/users`

### Obtener todos los usuarios

**Método:** `GET`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `ver_usuarios`

**Respuesta exitosa:**
```json
[
  {
    "id": "UUID",
    "username": "admin",
    "role": {
      "id": "UUID_ROL",
      "name": "admin"
    }
  },
  {
    "id": "UUID",
    "username": "cajero1",
    "role": {
      "id": "UUID_ROL",
      "name": "cajero"
    }
  },
  // Más usuarios...
]
```

### Crear usuario

**Método:** `POST`  
**Endpoint:** `/`  
**Auth requerida:** Sí (Bearer Token)  
**Permisos requeridos:** `gestionar_usuarios`

**Cuerpo de la solicitud:**
```json
{
  "username": "nuevo_usuario",
  "password": "contraseña",
  "role_id": "UUID_ROL"
}
```

**Respuesta exitosa:**
```json
{
  "id": "UUID",
  "username": "nuevo_usuario",
  "role_id": "UUID_ROL"
}
```

---

## Códigos de Estado HTTP

La API utiliza los siguientes códigos de estado HTTP:

- `200 OK`: La solicitud se completó exitosamente.
- `201 Created`: El recurso se creó correctamente.
- `400 Bad Request`: La solicitud no se pudo procesar debido a datos incorrectos.
- `401 Unauthorized`: No se proporcionó un token de autenticación válido.
- `403 Forbidden`: El usuario no tiene los permisos necesarios para la acción.
- `404 Not Found`: El recurso solicitado no existe.
- `500 Internal Server Error`: Error del servidor.

## Autenticación

Todas las rutas (excepto `/api/auth/login` y `/api/auth/register`) requieren autenticación mediante un token JWT.

Para autenticarse, incluya el token en el encabezado de la solicitud:

```
Authorization: Bearer <token>
```

## Errores

Cuando ocurre un error, la API devuelve un objeto JSON con la siguiente estructura:

```json
{
  "error": "Mensaje de error"
}
```

En algunos casos, se incluyen detalles adicionales:

```json
{
  "error": "Error al crear producto",
  "message": "Error específico",
  "details": "Detalles técnicos",
  "sql": "Consulta SQL con error (si aplica)"
}
```

## Ejemplos de Uso

### Flujo completo de venta

1. Iniciar sesión y obtener token JWT:

```
POST /api/auth/login
{
  "username": "cajero1",
  "password": "contraseña"
}
```

2. Abrir caja:

```
POST /api/cash-register/open
{
  "opening_amount": 50000.00,
  "opening_notes": "Apertura de caja turno mañana"
}
```

3. Crear una orden:

```
POST /api/orders
{
  "type": "orden",
  "customer_name": "Juan Pérez",
  "total_amount": 35000.00,
  "payment_method": "efectivo",
  "created_by": "UUID_USUARIO",
  "items": [
    {
      "product_id": "UUID_PRODUCTO",
      "product_name": "Nombre del producto",
      "quantity": 2,
      "unit_price": 15000.00,
      "final_price": 30000.00,
      "unit_label": "unidad"
    },
    {
      "product_id": "UUID_PRODUCTO2",
      "product_name": "Nombre del producto 2",
      "quantity": 1,
      "unit_price": 5000.00,
      "final_price": 5000.00,
      "unit_label": "unidad"
    }
  ]
}
```

4. Añadir orden a la cola:

```
POST /api/order-queue
{
  "order_id": "UUID_ORDEN",
  "priority": 0
}
```

5. Llamar al siguiente cliente:

```
POST /api/order-queue/call-next
```

6. Aplicar cupón (opcional):

```
POST /api/orders/UUID_ORDEN/apply-coupon
{
  "coupon_code": "DESCUENTO10",
  "payment_method": "efectivo"
}
```

7. Registrar transacción en caja:

```
POST /api/cash-register/transaction
{
  "cash_register_id": "UUID_CAJA",
  "order_id": "UUID_ORDEN",
  "type": "income",
  "amount": 31500.00,
  "payment_method": "efectivo",
  "description": "Pago de orden O001",
  "reference": "O001"
}
```

8. Generar comprobante:

```
POST /api/receipts
{
  "order_id": "UUID_ORDEN",
  "payment_method": "efectivo",
  "is_partial": false,
  "notes": "Pago completo"
}
```

9. Actualizar inventario:

```
POST /api/inventory/order/UUID_ORDEN
```

10. Marcar orden como procesada:

```
POST /api/order-queue/UUID_QUEUE_ENTRY/process
```

11. Cerrar caja al final del turno:

```
PUT /api/cash-register/UUID_CAJA/close
{
  "closing_amount": 150000.00,
  "closing_notes": "Cierre de caja turno mañana"
}
```

12. Generar reportes:

```
GET /api/cash-register/UUID_CAJA/report
```