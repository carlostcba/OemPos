# OemPOS - Sistema de Punto de Venta

Sistema de Punto de Venta (POS) multiplataforma desarrollado con Node.js + Express + SQL Server (backend) e Ionic Angular (frontend).

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express + Sequelize + SQL Server)
- **Base de datos**: SQL Server con 15+ tablas relacionales
- **ORM**: Sequelize v6.37.7 con soporte completo para SQL Server
- **Autenticación**: JWT con roles y permisos granulares
- **Almacenamiento de imágenes**: Sistema flexible (Base de datos/Disco/Cloud)
- **Logging**: Winston con timestamps locales (Argentina/Buenos_Aires)
- **Caché**: NodeCache para optimización de consultas

### Frontend (Ionic Angular)
- **Framework**: Angular 19 + Ionic 8
- **Navegación**: Lazy loading con guards de autenticación
- **Estado**: RxJS + Servicios reactivos
- **UI/UX**: Dark mode con diseño responsive

## 📊 Estado Actual del Desarrollo

### ✅ Backend - COMPLETADO (100%)

#### Infraestructura y Base de Datos
- **✅ Modelos Sequelize**: 15 modelos con relaciones complejas
- **✅ Migraciones**: Scripts de sincronización automática
- **✅ Conexión SQL Server**: Configuración robusta con manejo de errores
- **✅ Variables de entorno**: Configuración multi-ambiente

#### Sistema de Autenticación y Seguridad
- **✅ JWT Completo**: Login, registro, verificación de tokens
- **✅ Roles y Permisos**: 4 roles (admin, supervisor, cajero, vendedor)
- **✅ Middleware de Autorización**: `verifyToken`, `requirePermission`, `requireRole`
- **✅ Rate Limiting**: Protección contra ataques de fuerza bruta
- **✅ Seguridad**: Helmet, CORS, validaciones de entrada

#### APIs Implementadas (13 módulos)
- **✅ `/api/auth/*`** - Autenticación JWT completa
- **✅ `/api/products/*`** - CRUD de productos con categorías/subcategorías
- **✅ `/api/categories/*`** - Gestión de categorías
- **✅ `/api/subcategories/*`** - Gestión de subcategorías
- **✅ `/api/orders/*`** - Sistema completo de órdenes (4 tipos)
- **✅ `/api/order-queue/*`** - Cola de atención con priorización
- **✅ `/api/coupons/*`** - Sistema de cupones con reglas complejas
- **✅ `/api/cash-register/*`** - Apertura/cierre de caja con arqueo
- **✅ `/api/receipts/*`** - Generación y anulación de comprobantes
- **✅ `/api/inventory/*`** - Control de stock automatizado
- **✅ `/api/dashboard/*`** - Estadísticas y métricas en tiempo real
- **✅ `/api/images/*`** - Sistema de imágenes polimórfico
- **✅ `/api/audit/*`** - Logs de auditoría para trazabilidad

#### Funcionalidades Avanzadas
- **✅ Sistema de Órdenes**: 4 tipos (orden, pedido, delivery, salon)
- **✅ Códigos Automáticos**: Generación secuencial por tipo y día
- **✅ Sistema de Cupones**: Porcentual/fijo, categorías específicas, efectivo
- **✅ Cola de Atención**: Priorización automática y manual
- **✅ Control de Inventario**: Movimientos automáticos, toma de inventario
- **✅ Sistema de Caja**: Apertura, cierre, transacciones, reportes
- **✅ Comprobantes**: Generación, anulación, numeración automática
- **✅ Caché Inteligente**: Invalidación por patrones, TTL configurable
- **✅ Transacciones Robustas**: Reintentos automáticos, rollback

### 🔄 Frontend - EN PROGRESO (70%)

#### ✅ Infraestructura Completada
- **✅ Arquitectura Modular**: 8 módulos con lazy loading
- **✅ Autenticación JWT**: Login, guards, interceptores
- **✅ Servicios HTTP**: Manejo de errores y tokens automático
- **✅ Navegación**: Menú lateral dinámico por roles
- **✅ Diseño**: Dark mode profesional, responsive

#### ✅ Módulos Implementados

**📱 Auth Module (100%)**
- Login con validaciones
- Manejo de sesiones
- Guards de ruta por permisos
- Interceptor HTTP automático

**📦 Productos Module (100%)**
- Listado con búsqueda y filtros
- Modal de edición completo con categorías/subcategorías
- Formulario de creación con validaciones
- Integración completa con sistema de imágenes
- Manejo de estados de carga y errores

**🛒 Pedidos Module (80%)**
- Interfaz de nueva orden funcional
- Catálogo de productos con grid responsive
- Carrito de compras operativo
- Búsqueda y filtrado por categorías
- ⚠️ **Pendiente**: Integración completa con backend de órdenes

#### ⏳ Módulos Pendientes

**💰 Caja Module (20%)**
- ✅ Estructura base creada
- ❌ Implementación de apertura/cierre
- ❌ Arqueo de caja
- ❌ Historial de transacciones

**📊 Inventario Module (10%)**
- ✅ Estructura inicial
- ❌ Vista de stock actual
- ❌ Movimientos de inventario
- ❌ Alertas de stock bajo

**📈 Reportes Module (15%)**
- ✅ Estructura base
- ❌ Dashboard de métricas
- ❌ Gráficos con Chart.js
- ❌ Filtros de fechas

**⚙️ Admin Module (5%)**
- ✅ Estructura inicial
- ❌ Gestión de usuarios
- ❌ Configuración del sistema
- ❌ Mantenimiento

## 🔧 Funcionalidades Destacadas Implementadas

### Sistema de Imágenes Avanzado
```typescript
// backend/services/imageStorage.service.js
// Sistema polimórfico que soporta 3 estrategias:
// - Base de datos (BLOB)
// - Disco local con estructura organizada
// - Cloud storage (preparado para AWS S3/Cloudinary)
```

### Sistema de Cupones Inteligente
```javascript
// backend/controllers/coupon.controller.js
// Soporte para:
// - Descuentos porcentuales y montos fijos
// - Restricciones por categoría
// - Cupones exclusivos para efectivo
// - Límites de uso y fechas de validez
```

### Cola de Atención Dinámica
```javascript
// backend/controllers/orderQueue.controller.js
// Características:
// - Priorización automática y manual
// - Reordenamiento en tiempo real
// - Estados: waiting, called, processed
```

### Dashboard con Métricas en Tiempo Real
```javascript
// backend/controllers/dashboard.controller.js
// Métricas incluidas:
// - Ventas por día/semana/mes
// - Top productos más vendidos
// - Estadísticas por método de pago
// - Control de inventario con alertas
```

## 📋 Modelos de Base de Datos

### Principales Entidades
- **Products**: Productos con categorías, stock, precios
- **Orders**: Órdenes con 4 tipos diferentes
- **OrderItems**: Detalles de órdenes con descuentos
- **OrderQueue**: Cola de atención priorizada
- **Coupons**: Sistema de cupones con reglas
- **CashRegister**: Control de caja con transacciones
- **Receipts**: Comprobantes con numeración automática
- **InventoryMovements**: Trazabilidad de stock
- **Images**: Sistema de imágenes polimórfico
- **Users/Roles/Permissions**: Autenticación granular

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js v18+
- SQL Server 2019+ (Express/Standard)
- Ionic CLI v8+
- Angular CLI v19+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
node scripts/test-sql-connection.js
node scripts/sync-image-tables.js
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
ionic serve
```

### Variables de Entorno (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=tu_password
DB_NAME=gustados
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=8h

# Servidor
PORT=3001
BASE_URL=http://localhost:3001

# Imágenes
IMAGE_STORAGE=database
IMAGE_MAX_SIZE=5242880
TIMEZONE=America/Argentina/Buenos_Aires
```

## 🧪 Testing y Calidad

### Cobertura de Testing
- **Backend**: 78% (Jest + Supertest)
- **Frontend**: 25% (Jasmine + Karma)
- **E2E**: Pendiente (Cypress)

### Scripts de Validación
```bash
# Backend
npm run test
npm run validate:data
node scripts/sql-diagnostics.js

# Frontend
ng test
ng lint
```

## 📊 Métricas del Proyecto

### Líneas de Código
- **Backend**: ~15,000 LOC
- **Frontend**: ~8,000 LOC
- **Total**: ~23,000 LOC

### Archivos por Categoría
- **Modelos**: 15 archivos
- **Controladores**: 13 archivos
- **Rutas**: 13 archivos
- **Servicios**: 8 archivos
- **Componentes**: 12 archivos

## 🔮 Próximas Funcionalidades

### Sprint Actual - Finalizar Módulos Core
**Objetivo**: Completar integración frontend-backend

1. **Completar módulo de pedidos** (2 semanas)
   - Integrar carrito con API de órdenes
   - Implementar aplicación de cupones
   - Añadir confirmación de pedidos

2. **Implementar módulo de caja** (2 semanas)
   - Apertura/cierre de caja
   - Arqueo automático
   - Historial de transacciones

3. **Dashboard funcional** (1 semana)
   - Gráficos con Chart.js
   - Métricas en tiempo real
   - Filtros de fecha

### Features Futuras
- **Modo Offline**: Sincronización cuando hay conexión
- **Scanner de Códigos**: Integración con cámara
- **Builds Móviles**: Android/iOS con Capacitor
- **Multi-tienda**: Soporte para múltiples sucursales

## 🔐 Seguridad Implementada

### Autenticación y Autorización
- JWT con refresh tokens automático
- Roles granulares con permisos específicos
- Middleware de autorización en todas las rutas protegidas
- Rate limiting para prevenir ataques

### Validación de Datos
- Validación de entrada en todos los endpoints
- Sanitización de datos SQL injection-safe
- Manejo seguro de imágenes con validación de tipo

### Auditoría
- Log de todas las operaciones críticas
- Trazabilidad de cambios con timestamps
- Registro de accesos y errores

## 🌟 Características Técnicas Destacadas

### Performance
- Caché inteligente con invalidación automática
- Consultas optimizadas con Sequelize
- Compresión gzip en respuestas
- Lazy loading en frontend

### Robustez
- Manejo de errores granular
- Transacciones con rollback automático
- Reintentos automáticos en operaciones críticas
- Graceful shutdown del servidor

### Escalabilidad
- Arquitectura modular y extensible
- Sistema de plugins para nuevas funcionalidades
- Base de datos normalizada con índices optimizados
- Preparado para containerización

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

### 💡 Documentación de API disponible en la [Wiki](https://github.com/carlostcba/oempos/wiki) del proyecto.

---

## 📞 Soporte y Contribución

### Documentación
- Comentarios detallados en código crítico
- Logs estructurados para debugging
- Scripts de diagnóstico automático

### Desarrollo
- Convenciones de código establecidas
- Estructura de commits semántica
- Testing automatizado en pipeline

---

**Estado del Proyecto**: 🟡 **En Desarrollo Activo**  
**Última Actualización**: Enero 2025  
**Versión Actual**: v1.0.0-beta  
**Ambiente**: Desarrollo/Testing  

*Sistema desarrollado para gestión completa de punto de venta con arquitectura empresarial y funcionalidades avanzadas.*
