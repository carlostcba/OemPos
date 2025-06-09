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

<<<<<<< HEAD
## 🧱 Arquitectura del Sistema

- **Backend:** Node.js + Express
- **ORM:** Sequelize
- **Base de Datos:** SQL Server 2022
- **Autenticación:** JWT con sistema de roles y permisos
- **Frontend:** Ionic Framework (Angular)

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

## 🚀 Mejoras implementadas

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

### 🔄 Frontend - Componentes Implementados
- **Sistema de autenticación**: Login con JWT y almacenamiento seguro de token
- **Interceptor HTTP**: Inyección automática de token en solicitudes
- **Guardias de ruta**: Protección de rutas según autenticación
- **Estructura modular**: Módulos lazy-loading para optimización de carga
- **Servicios centralizados**: Gestión de estado y comunicación con API

---

## 🔄 Frontend - Componentes Implementados

### Auth
- ✅ Login con validación y manejo de errores
- ✅ Interceptor HTTP para inyección automática de token
- ✅ Guardias de ruta por roles de usuario
- ✅ Reautenticación automática

### Productos
- ✅ Listado con búsqueda y filtros
- ✅ Modal de edición con formulario reactivo
- ✅ Carga de imágenes mediante galería
- ✅ Vista detalle con información completa

### Pedidos
- ✅ Pantalla de nuevo pedido con selección de productos
- ✅ Carrito de compra con cálculo de totales
- ✅ Selección de método de pago
- ⏳ Cola de atención (en progreso)

### Layout y Navegación
- ✅ Menú lateral dinámico según roles
- ✅ Estructura responsive para desktop y móvil
- ✅ Tema oscuro completo
- ✅ Correcciones para accesibilidad

---

## 📱 Frontend - Estructura Modular

El frontend se ha organizado en módulos funcionales para facilitar el mantenimiento:

- **Core**: Servicios centrales, interceptores, modelos y guardias
- **Shared**: Componentes reutilizables y directivas
- **Auth**: Módulo de autenticación y autorización
- **Admin**: Dashboard y configuración administrativa
- **Productos**: Gestión de productos y categorías
- **Pedidos**: Creación y gestión de pedidos
- **Caja**: Operaciones de caja y pagos
- **Inventario**: Control de stock y movimientos
- **Reportes**: Estadísticas y reportes generales

---

## 📚 Tecnologías Utilizadas

### Backend
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

### Frontend
- Ionic Framework v8.0
- Angular v19.0
- RxJS para programación reactiva
- IonicStorage para almacenamiento local
- JWT-decode para manejo de tokens
- Ionic Native para acceso a funciones nativas

---

## 🚀 Avances Recientes

### Frontend
- ✅ Implementación del componente de nuevo pedido con interfaz intuitiva
- ✅ Sistema de carga y visualización de imágenes para productos
- ✅ Mejoras en el rendimiento y experiencia de usuario
- ✅ Correcciones en el sistema de autenticación y manejo de tokens
- ✅ Adaptación responsiva para distintos tamaños de pantalla

### Backend
- ✅ Optimización de rutas para compatibilidad mejorada con roles
- ✅ Sistema de gestión de imágenes con múltiples estrategias de almacenamiento
- ✅ Implementación de caché para consultas frecuentes
- ✅ Mejoras en seguridad con middlewares especializados
- ✅ Logs estructurados para mejor diagnóstico

---

## 🔍 Próximas Implementaciones

| Prioridad | Tarea | Estado |
|-----------|-------|--------|
| 🔥 | Completar interfaces de usuario para todos los módulos | ⏳ En progreso (60%) |
| 🔥 | Implementar gestión de pedidos y cola de atención | ⏳ En progreso (40%) |
| 🔥 | Implementar integración con impresoras térmicas | 📅 Pendiente |
| 🔥 | Sistema de envío de comprobantes por email | 📅 Pendiente |
| 🛠️ | Implementar tests automatizados | ✅ Estructura básica lista |
| 🛠️ | Sistema de backups y restauración | 📅 Pendiente |
| 🛠️ | Integración con métodos de pago electrónicos | 📅 Pendiente |
| 🛠️ | Funcionalidad offline con sincronización | 📅 Pendiente |

---

## 📂 Estructura del Proyecto

```
oempos/
├── backend/         # API REST en Node.js + Express
│   ├── config/      # Configuración de BD y entorno
│   ├── controllers/ # Lógica de negocio
│   ├── middlewares/ # Middlewares de autenticación, etc.
│   ├── models/      # Modelos Sequelize
│   ├── routes/      # Definición de rutas API
│   ├── utils/       # Utilidades (caché, logging, etc.)
│   ├── scripts/     # Scripts de mantenimiento
│   ├── strategies/  # Estrategias para almacenamiento de imágenes
│   └── logs/        # Directorio de logs
│
├── frontend/        # Aplicación Ionic Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/      # Módulo de administración
│   │   │   ├── auth/       # Autenticación y login
│   │   │   ├── caja/       # Módulo de caja
│   │   │   ├── core/       # Servicios centralizados
│   │   │   ├── inventario/ # Gestión de inventario
│   │   │   ├── pedidos/    # Gestión de pedidos
│   │   │   ├── productos/  # Gestión de productos
│   │   │   ├── reportes/   # Informes y estadísticas
│   │   │   └── shared/     # Componentes compartidos
│   │   ├── assets/         # Recursos estáticos
│   │   ├── environments/   # Configuración por entorno
│   │   └── theme/          # Estilo global
│   ├── capacitor.config.ts # Configuración para móviles
│   └── ionic.config.json   # Configuración de Ionic
│
└── docs/            # Documentación del proyecto
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
IMAGE_STORAGE=database
```

---

## 🚀 Instalación y Ejecución

### Backend
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/oempos.git

# Instalar dependencias del backend
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

### Frontend
```bash
# Instalar dependencias del frontend
cd oempos/frontend

npm install -g @ionic/cli

npm install

# Iniciar servidor de desarrollo
ionic serve

# Compilar para producción
ionic build --prod

# Generar aplicación para Android
ionic capacitor add android
ionic capacitor build android
```

> El backend corre en `http://localhost:3001` por defecto.
> El frontend corre en `http://localhost:8100` por defecto.

---

=======
>>>>>>> b5f560bb007cebe4ba048c85a6039125e4dbe0a2
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

<<<<<<< HEAD
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama con tu característica (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y commits (`git commit -m 'Add amazing feature'`)
4. Sube tu rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## soy wade
=======
*Sistema desarrollado para gestión completa de punto de venta con arquitectura empresarial y funcionalidades avanzadas.*
>>>>>>> b5f560bb007cebe4ba048c85a6039125e4dbe0a2
