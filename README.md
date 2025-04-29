
# OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y MSSQL como parte de la arquitectura del proyecto OemPos.

---

## 🛍️ Etapas del Proyecto

### Semana 1-2: Setup del Proyecto
- ✅ MSSQL conectado, Sequelize configurado
- ✅ Models Product, User, Category, Subcategory, ProductImage
- ✅ CRUD Products funcionando

### Semana 3-4: Autenticación y Seguridad
- ✅ Login funcional
- ✅ JWT funcionando
- ✅ Middleware verifyToken activo
- 🔸 Falta implementar requireRole() en rutas sensibles

### Semana 5-6: Ventas y Cupones
- ⏳ CRUD de Orders, OrderItems, OrderQueue funcionando
- ⏳ Generación de código especial (O001, P001, D001, S001)
- ⏳ Faltante: aplicar cupones con descuentos reales sobre efectivo

### Semana 7-8: Reportes y Caja
- ❌ No iniciado

### Semana 9+: Frontend Ionic + Tests
- ❌ No iniciado

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
8. Realiza cierre turno / caja

---

### 📊 Reportes
- Ventas diarias / semanales / mensuales
- Uso de cupones
- Productos más vendidos

### 💼 Caja
- Apertura y fondo inicial
- Arqueo de caja
- Control de diferencias
- Exportación de reportes (Excel/PDF)

### 📆 Tickets / Cola de atención
- Administración de prioridad
- Llamado a clientes según estado

### 💳 Cupones
- Validación avanzada
- Cálculo proporcional efectivo/productos elegibles
- Registro de uso de cupones

---

## 👥 Roles del Sistema

- **VENDEDOR**: carga pedidos
- **CAJERO**: procesa pagos
- **SUPERVISOR**: audita operaciones
- **ADMINISTRADOR**: configura parámetros

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

## 🔐 Seguridad
- Middleware `verifyToken` activo
- Falta aplicar `requireRole('rol')` en rutas sensibles

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

## 📢 Estado Actual OemPOS - Backend

| Etapa                           | Estado         | Detalle |
|----------------------------------|----------------|---------|
| Semana 1-2: Setup del Proyecto   | ✅ COMPLETO  | MSSQL + Models + CRUD Products |
| Semana 3-4: Seguridad            | ✅ 99% Completo | Login + JWT. Falta control de roles |
| Semana 5-6: Ventas y Cupones     | ⏳ En Progreso  | CRUD Orders + OrderItems + OrderQueue |
| Semana 7-8: Reportes y Caja      | ❌ No iniciado |  |
| Semana 9+: Frontend Ionic + Tests| ❌ No iniciado |  |

---

## 🔍 Prioridades Inmediatas

| Prioridad | Tarea |
|-----------|-------|
| 🔥 | Agregar middleware requireRole en rutas |
| 🔥 | Implementar cálculo y aplicación de cupones según efectivo |
| ✅ | Testear flujo completo: orden -> productos -> cupón -> pago |
| 🛠️ | Preparar cierre de caja (después) |

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
npm install --save-dev nodemon
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
