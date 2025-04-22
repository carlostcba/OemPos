
# OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y MSSQL como parte de la arquitectura del proyecto OemStock.

---

## 🧭 Etapas del Proyecto

### Semana 1-2: Setup del Proyecto
- ✅ Conexión a MSSQL
- ✅ Definición de modelos: Product, User, Category, etc.
- ✅ CRUD de productos funcionando

### Semana 3-4: Gestión de Autenticación y Seguridad
- [ ] Implementar login y registro
- [ ] Protecciones con JWT y roles (`admin`, `vendedor`)
- [ ] Seed de usuario admin inicial

### Semana 5-6: Ventas y Cupones
- [ ] CRUD de ventas y pedidos
- [ ] Lógica de cupones y condiciones
- [ ] Control por medio de pago (efectivo/tarjeta)

### Semana 7-8: Reportes y Caja
- [ ] Ventas por producto/categoría
- [ ] Reporte de cupones aplicados
- [ ] Cierre de caja, arqueos y estadísticas

### Semana 9+: Frontend Ionic + Tests
- [ ] Conexión con Frontend Ionic
- [ ] Testeo unitario y validaciones

---

## 🔁 Modelo de Negocio y Flujo de Trabajo

### 🧩 Modelo de Negocio
- **Tipo**: Venta minorista presencial
- **Canal**: Punto de orden (vendedor) + Punto de caja (cajero)
- **Clientes**: ORDEN (inmediato) / PEDIDO (programado)
- **Medios de Pago**: Efectivo, Tarjeta, Transferencia
- **Valor Agregado**: Descuentos solo en efectivo, pedidos programables
- **Sistema**: Transacciones, cupones, comprobantes, estadísticas

---

### 🔄 Flujo de Trabajo

#### 👤 VENDEDOR (Punto de Orden)
1. Recibe al cliente
2. Registra tipo de transacción: ORDEN o PEDIDO
3. Datos del cliente:
   - ORDEN: solo nombre
   - PEDIDO: nombre, tel, email, fecha/hora
4. Agrega productos
5. Sistema genera N° único
6. Registra medio de pago
7. Envía transacción al cajero

#### 💵 CAJERO (Punto de Caja)
1. Recibe y prioriza transacciones
2. Llama al cliente
3. Confirma/cambia medio de pago
4. Procesa cobro:
   - Tarjeta: POS
   - Efectivo: aplica cupón
   - Transferencia: registra referencia
5. En PEDIDO: cobra seña / saldo
6. Genera comprobante
7. Actualiza estadísticas
8. Realiza cierre de caja

---

## ✅ Funcionalidades Faltantes

### 📊 Reportes
- Ventas diarias / semanales / mensuales
- Cupones aplicados por día / valor descontado
- Pedidos por estado y tasa de cancelación
- Estadísticas de caja por método de pago

### 💼 Funciones de Caja
- **Apertura**: fondo inicial, cajero
- **Movimiento**: ingresos, egresos, señas
- **Cierre**: totales, diferencias, firma
- **Historial**: cierres por turno, exportable
- **Alertas**: diferencias y cupones de alto valor

---

## 👥 Roles del Sistema

### VENDEDOR
- Carga ORDEN/PEDIDO
- Elige método de pago
- No cobra ni aplica cupones

### CAJERO
- Cobra, aplica cupones
- Maneja señas y saldos
- Realiza arqueos y cierres

### SUPERVISOR
- Reportes, historial, auditoría

### ADMINISTRADOR
- Configura sistema
- Carga usuarios, productos y reglas

---

## 🔐 Sistema de Roles Modulares

### Permisos por módulo

#### 📦 Transacciones
- ver_transacciones
- crear_orden
- crear_pedido
- modificar_transacciones

#### 🧾 Pagos y Caja
- procesar_pagos
- aplicar_cupones
- registrar_senias_y_saldos
- abrir_caja
- realizar_arqueos
- cerrar_caja
- ver_historial_caja

#### 📊 Reportes
- ver_reporte_ventas
- ver_reporte_cupones
- ver_reporte_caja
- exportar_reportes

#### ⚙️ Administración
- gestionar_usuarios
- gestionar_productos
- gestionar_cupones
- configurar_parametros

### Ejemplo de Rol: Super Cajero
Permisos asignados:
- ✅ Todos los de cajero
- ✅ ver_reporte_caja
- ✅ ver_reporte_cupones

--- 

## 🧱 Arquitectura General

- **Backend:** Node.js + Express
- **ORM:** Sequelize (MSSQL)
- **Base de Datos:** SQL Server 2022
- **Autenticación:** JWT con roles
- **Frontend (próximo):** Ionic Framework

### 🔗 Relaciones
- Product → Category / Subcategory / ProductImage / User
- Venta → Productos y métodos de pago

---

## ✨ Estado del Proyecto

✅ Conexión a base de datos MSSQL  
✅ Estructura modular backend  
✅ CRUD de productos con relaciones  
✅ Middleware de autenticación y control de roles JWT  
✅ Pruebas con Postman exitosas  

Próxima etapa: gestión de usuarios y autenticación completa (`auth.controller.js`, hashing de contraseñas, login/register).

---

## 📚 Tecnologías

- Node.js
- Express.js
- Sequelize ORM
- SQL Server 2022 (MSSQL)
- JWT para autenticación
- Postman para pruebas de API

---

## 📂 Estructura del Proyecto (backend)

```
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
```

---

## ✅ Endpoints Disponibles (requieren token)

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Middleware:
- `verifyToken`: valida JWT
- `requireRole('admin')`: restringe según rol

---

## 🌐 Variables de entorno (.env)

```
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=...
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
JWT_SECRET=secreto123
```

---

## ⚡ Recomendaciones Siguientes

- [ ] Crear `auth.controller.js` (login, registro, token)
- [ ] Hashear contraseñas (`bcrypt`)
- [ ] Endpoint `POST /api/auth/login`
- [ ] Proteger más rutas con `verifyToken`
- [ ] Crear seeder inicial para usuario admin

---

## 🚀 Comenzar

```bash
cd backend
npm install
node server.js
```

> El backend corre en `http://localhost:3001`.

---

### 🐞 Ejecutar en modo depuración (nodemon)

Para evitar reiniciar manualmente con `Ctrl + C`, instalá nodemon y usalo así:

```bash
npm install -g nodemon
nodemon server.js
```

O bien, agregalo como script en `package.json`:

```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Y ejecutá:

```bash
npm run dev
```

---

### 💡 Documentación y colección Postman disponible a pedido.
