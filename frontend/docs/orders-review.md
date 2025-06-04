# Revisión módulo `orders`

Se detectaron inconsistencias y oportunidades de mejora en los componentes y servicios bajo `src/app/orders`.

## Problemas encontrados

- **Uso de `AuthService` incorrecto en `order-details.guard.ts`**: se importaba la versión antigua del servicio desde `auth/auth.service` y se utilizaba el método `isAuthenticated()`. Esto podía producir fallos de compilación y comportamiento inconsistente, ya que el resto de la aplicación emplea el servicio ubicado en `core/services`.
- **Falta de tooling**: el proyecto no incluye scripts de linting/test preconfigurados para ejecutarse sin Angular CLI instalado en producción. Esto dificulta validar los cambios automáticamente.

## Tareas propuestas

1. **Unificar el servicio de autenticación**
   - Reemplazar todas las importaciones de `../../auth/auth.service` por `../../core/services/auth.service`.
   - Adaptar llamadas a métodos de autenticación usando la API actual del servicio (`checkStoredToken`, `currentUser`).

2. **Mejorar verificación de autenticación en guards**
   - Sustituir el uso obsoleto de `isAuthenticated()` por `checkStoredToken()` o validación del token almacenado.
   - Asegurar que los guards funcionen de manera asíncrona y manejen correctamente los `LoadingController`.

3. **Agregar pruebas unitarias del módulo de órdenes**
   - Crear `order-details.guard.spec.ts` y otros archivos de prueba para verificar rutas y permisos.
   - Incluir mocks de servicios (`AuthService`, `OrderService`) para aislar comportamiento.

4. **Documentar flujo de trabajo del módulo**
   - Mantener un archivo en `frontend/docs/` con guías de uso y notas de mantenimiento del código.

La corrección incluida en este commit aborda el punto 1 para `order-details.guard.ts`.
