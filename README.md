# OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y SQL Server como backend, con Ionic Angular como frontend.

## 🛍️ Estado Actual del Proyecto

### ✅ Backend Completado (100%)
#### Sprint 1-2: Setup del Proyecto ✅
- Base de datos SQL Server conectada mediante Sequelize
- 13 modelos implementados con relaciones complejas
- Sistema completo de relaciones entre entidades
- CRUD completo para todas las entidades

#### Sprint 3-4: Autenticación y Seguridad ✅
- Sistema de autenticación JWT robusto
- Middleware `verifyToken` con manejo de errores
- Sistema de roles y permisos granular
- Rate limiting implementado
- Headers de seguridad (Helmet)

#### Sprint 5-6: Ventas y Cupones ✅
- Sistema completo de órdenes con 4 tipos (orden, pedido, delivery, salon)
- Códigos automáticos por tipo (O001, P001, D001, S001)
- Sistema de cupones con reglas complejas
- Cola de atención con priorización
- Integración con sistema de caja

#### Sprint 7-8: Reportes y Caja ✅
- Sistema completo de caja con apertura/cierre
- Reportes detallados por múltiples criterios
- Dashboard con estadísticas en tiempo real
- Control de inventario automatizado
- Generación de comprobantes

#### Sprint 9-10: Optimizaciones ✅
- Sistema de caché con NodeCache
- Transacciones con reintentos automáticos
- Logging estructurado con Winston
- Compresión de respuestas
- Graceful shutdown implementado

### 🔄 Frontend en Progreso (65%)

#### Sprint 11-12: Frontend Core ✅ Completado
- ✅ Arquitectura modular con lazy loading
- ✅ Sistema de autenticación JWT completo
- ✅ Interceptor HTTP con manejo de tokens
- ✅ Guards de ruta funcionando
- ✅ Login con diseño dark mode profesional
- ✅ Menú lateral dinámico por roles
- ✅ Sistema de navegación completo

#### Sprint 13-14: Módulos Funcionales 🔄 En Progreso (70%)
- ✅ **Módulo de Productos (100%)**
  - Listado con búsqueda y filtros
  - Formulario de creación/edición
  - Integración completa con API
  - Manejo de errores y loading states

- ✅ **Módulo de Pedidos (80%)**
  - Interfaz de nueva orden implementada
  - Catálogo de productos con grid responsive
  - Carrito de compras funcional
  - Búsqueda y filtrado por categorías
  - ⏳ Falta: Persistencia de pedidos en backend

- ⏳ **Módulo de Caja (10%)**
  - Estructura base creada
  - Falta implementación completa

- ⏳ **Módulo de Inventario (5%)**
  - Solo estructura inicial

- ⏳ **Módulo de Reportes (5%)**
  - Solo estructura inicial

## 🏗️ Arquitectura Técnica

### Backend - Stack Tecnológico
Node.js v18+ → Express v5.1.0 → Sequelize v6.37.7 → SQL Server 2022

#### Estructura de Capas
- **Routes** → Define endpoints y validaciones
- **Middlewares** → Autenticación, permisos, rate limiting
- **Controllers** → Lógica de negocio
- **Models** → Definición de entidades
- **Utils** → Caché, logging, transacciones

#### APIs Implementadas
- ✅ `/api/auth/*` - Login, registro, verificación de token
- ✅ `/api/products/*` - CRUD completo de productos
- ✅ `/api/orders/*` - Gestión completa de órdenes
- ✅ `/api/order-queue/*` - Sistema de cola de atención
- ✅ `/api/coupons/*` - Gestión y aplicación de cupones
- ✅ `/api/cash-register/*` - Apertura, cierre y arqueo de caja
- ✅ `/api/receipts/*` - Generación de comprobantes
- ✅ `/api/inventory/*` - Movimientos y reportes de inventario
- ✅ `/api/dashboard/*` - Estadísticas y métricas

### Frontend - Stack Tecnológico
Ionic v8.0 → Angular v19.0 → RxJS → JWT → Capacitor

#### Arquitectura Modular
```txt
src/app/
├── core/
│   ├── services/
│   ├── interceptors/
│   └── guards/
├── auth/
├── admin/
├── productos/
├── pedidos/
├── caja/
├── inventario/
├── reportes/
└── shared/
```
## 🔄 Metodología Scrum Implementada

### 📋 Configuración de Sprints

- **Duración**: 2 semanas  
- **Velocity promedio**: 43 puntos  

**Ceremonias:**
- 🗓️ **Sprint Planning**: Lunes (2h)
- 🔁 **Daily Scrum**: Diario (15min)
- ✅ **Sprint Review**: Viernes S2 (1h)
- 🔍 **Sprint Retrospective**: Viernes S2 (30min)

## 📊 Product Backlog Priorizado

### 🚀 Sprint 15: Finalizar Módulos Core (Próximo)
**Fecha**: 6-17 Enero 2025  
**Story Points**: 40

**User Stories**:
- **Completar flujo de pedidos** (13 pts)
  - COMO vendedor QUIERO crear y enviar pedidos al backend PARA que se registren en el sistema
  - Tareas:
    - Integrar servicio de órdenes
    - Implementar validaciones
    - Añadir confirmación de pedido
    - Manejar errores de red

- **Implementar módulo de caja** (13 pts)
  - COMO cajero QUIERO abrir y cerrar caja PARA controlar el flujo de efectivo
  - Tareas:
    - Crear componentes apertura/cierre
    - Implementar arqueo de caja
    - Mostrar transacciones del día
    - Generar reporte de cierre

- **Dashboard con métricas** (8 pts)
  - COMO administrador QUIERO ver estadísticas en tiempo real PARA tomar decisiones informadas
  - Tareas:
    - Integrar Chart.js
    - Crear widgets de métricas
    - Implementar filtros de fecha
    - Añadir auto-refresh

- **Gestión básica de inventario** (6 pts)
  - COMO supervisor QUIERO ver el stock actual PARA evitar quiebres de stock
  - Tareas:
    - Crear vista de inventario
    - Implementar alertas de stock bajo
    - Añadir búsqueda y filtros

### 🎨 Sprint 16: UX/UI y Features Avanzadas
**Fecha**: 20-31 Enero 2025  
**Story Points**: 38

- Escáner de códigos de barras (13 pts)
- Optimización de rendimiento (8 pts)
- Modo offline básico (10 pts)
- Gestión de usuarios (7 pts)

### 📱 Sprint 17: Mobile y Desktop
**Fecha**: 3-14 Febrero 2025  
**Story Points**: 42

- Build para Android (10 pts)
- Build para iOS (10 pts)
- Versión Electron para desktop (12 pts)
- Testing end-to-end (10 pts)

### 🚀 Sprint 18: Despliegue y Documentación
**Fecha**: 17-28 Febrero 2025  
**Story Points**: 35

- CI/CD Pipeline (10 pts)
- Documentación de usuario (8 pts)
- Videos tutoriales (7 pts)
- Deployment en producción (10 pts)

## 📈 Métricas del Proyecto

### Velocity por Sprint
- Sprint 1-2: ████████████████████ 40
- Sprint 3-4: ██████████████████████▌ 45
- Sprint 5-6: █████████████████████████ 50
- Sprint 7-8: ████████████████████████ 48
- Sprint 9-10: █████████████████████ 42
- Sprint 11-12: ████████████████▌ 35
- Sprint 13-14: ████████████████████ 40 (actual)

### Burndown Sprint Actual (13-14)
- Total: 40 puntos
- Completados: 28 puntos (70%)
- Pendientes: 12 puntos
- Días restantes: 4

### Coverage de Testing
- Backend: 78% (Jest + Supertest)
- Frontend: 15% (Jasmine + Karma)
- E2E: 0% (Pendiente)

## 🚦 Estado de Módulos

### Backend Modules
| Módulo    | Estado    | Coverage | Performance |
|-----------|-----------|----------|-------------|
| Auth      | ✅ 100%    | 85%      | < 50ms      |
| Products  | ✅ 100%    | 80%      | < 100ms     |
| Orders    | ✅ 100%    | 75%      | < 150ms     |
| Coupons   | ✅ 100%    | 70%      | < 80ms      |
| Cash      | ✅ 100%    | 82%      | < 120ms     |
| Inventory | ✅ 100%    | 78%      | < 100ms     |
| Reports   | ✅ 100%    | 73%      | < 200ms     |

### Frontend Modules
| Módulo     | UI       | Lógica    | Integración | Testing  |
|------------|----------|-----------|-------------|----------|
| Auth       | ✅ 100%  | ✅ 100%   | ✅ 100%     | ⚠️ 40%   |
| Productos  | ✅ 100%  | ✅ 100%   | ✅ 100%     | ⚠️ 30%   |
| Pedidos    | ✅ 95%   | ✅ 85%    | ⚠️ 60%      | ❌ 10%   |
| Caja       | ⚠️ 30%  | ❌ 20%    | ❌ 10%      | ❌ 0%    |
| Inventario | ❌ 10%   | ❌ 5%     | ❌ 0%       | ❌ 0%    |
| Reportes   | ❌ 10%   | ❌ 5%     | ❌ 0%       | ❌ 0%    |

## 🐛 Issues Conocidos

### Alta Prioridad
- Performance: Listas grandes causan lag (necesita virtual scroll)
- Estado Global: Falta implementar NgRx para estado compartido
- Offline: Sin funcionalidad offline actualmente

### Media Prioridad
- Validaciones: Faltan validaciones en algunos formularios
- Errores: Manejo inconsistente de errores de red
- UX: Falta feedback visual en algunas acciones

### Baja Prioridad
- Accesibilidad: Falta soporte ARIA completo
- i18n: Sin soporte multi-idioma
- PWA: Sin manifest.json configurado

## 🧾 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver LICENSE para detalles.
