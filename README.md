# OemPOS

Sistema de Punto de Venta (POS) multiplataforma desarrollado en Node.js, Express, Sequelize y SQL Server como backend, con Ionic Angular como frontend.

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

### Semana 11-12: Frontend Ionic - Estructura Base ✅ COMPLETADO (100%)
- Configuración inicial del proyecto Ionic Angular
- Estructura modular por características implementada
- Sistema de autenticación con JWT implementado
- Interceptor HTTP para manejo de tokens
- Guardias de ruta para protección de páginas
- Módulos lazy-loading configurados
- Componente de login funcional
- Dashboard administrativo básico
- Integración con backend para autenticación

### Semana 13-14: Frontend Ionic - Módulos Funcionales ✅ COMPLETADO (70%)
- Navegación principal y menú lateral completada
- Módulo de Productos con funcionalidad de listado, edición y modal
- Módulo de Pedidos con vista de creación implementada
- Menú de navegación con accesos según roles de usuario
- Comunicación con API y manejo de tokens
- Sistema de carga de imágenes y visualización
- Manejo de errores y feedback al usuario
- Estilos y temas personalizados (modo oscuro)
- Optimizaciones para dispositivos móviles

### Semana 15-16: Integración y UX ⏳ EN PROGRESO (35%)
- Completar UI/UX de todas las pantallas - ✅ Parcialmente completado
- Formularios avanzados con validación - ✅ Implementado en módulos existentes
- Integración con cámara para escaneo de códigos - ⏳ Pendiente
- Gestión de usuarios y permisos desde frontend - ⏳ Pendiente
- Pruebas de integración entre frontend y backend - ⏳ Pendiente

### Semana 17-18: Funcionalidad Offline y Despliegue
- Sincronización offline con IndexedDB
- Gestión de conflictos en datos
- Configuración de entorno de producción
- Empaquetado para plataformas móviles (Android/iOS)
- Empaquetado para escritorio con Electron
- Documentación de usuario final

---

## 🔄 Modelo de Negocio y Flujo de Trabajo

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
IMAGE_STORAGE=disk
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