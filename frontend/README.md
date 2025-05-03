# OemPOS Frontend

Aplicación frontend para el sistema de Punto de Venta OemPOS, desarrollada con Ionic Angular.

## Requisitos

- Node.js v14 o superior
- npm v7 o superior
- Ionic CLI v6 o superior

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ionic serve
```

## Estructura

El proyecto sigue una arquitectura modular por características:

- **auth**: Módulo de autenticación y autorización
- **productos**: Gestión de productos
- **pedidos**: Creación y gestión de pedidos
- **caja**: Operaciones de caja registradora
- **inventario**: Control de inventario
- **reportes**: Informes y estadísticas
- **admin**: Configuración y administración

## Integración con Backend

La aplicación se comunica con el backend de OemPOS a través de una API REST. La configuración se encuentra en los archivos de entorno (`environment.ts` y `environment.prod.ts`).

