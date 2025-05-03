#!/bin/bash

# Script para crear proyecto Ionic y estructura de directorios para OemPOS

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Ionic CLI está instalado
check_ionic() {
  if ! command -v ionic &> /dev/null; then
    echo -e "${RED}Ionic CLI no está instalado. Instalando...${NC}"
    npm install -g @ionic/cli
  else
    echo -e "${GREEN}✓ Ionic CLI ya está instalado${NC}"
  fi
}

# Crear proyecto Ionic base
create_ionic_project() {
  echo -e "${BLUE}Creando proyecto Ionic base...${NC}"
  
  # Verificar si el directorio frontend ya existe
  if [ -d "frontend" ]; then
    echo -e "${RED}El directorio frontend ya existe. ¿Deseas reemplazarlo? (s/n)${NC}"
    read -r respuesta
    if [ "$respuesta" = "s" ]; then
      echo -e "${BLUE}Eliminando directorio frontend existente...${NC}"
      rm -rf frontend
    else
      echo -e "${RED}Operación cancelada.${NC}"
      exit 1
    fi
  fi
  
  # Crear proyecto Ionic
  ionic start frontend blank --type=angular
  
  # Verificar si se creó correctamente
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error al crear el proyecto Ionic. Abortando.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Proyecto Ionic creado exitosamente${NC}"
}

# Crear estructura personalizada sobre el proyecto Ionic base
create_custom_structure() {
  echo -e "${BLUE}Creando estructura personalizada...${NC}"
  
  # Navegar al directorio del proyecto
  cd frontend
  
  # Crear directorios adicionales para módulos
  mkdir -p src/app/auth/guards
  mkdir -p src/app/auth/login
  
  mkdir -p src/app/productos/components
  mkdir -p src/app/productos/lista
  mkdir -p src/app/productos/detalle
  mkdir -p src/app/productos/crear-editar
  
  mkdir -p src/app/pedidos/components
  mkdir -p src/app/pedidos/lista
  mkdir -p src/app/pedidos/detalle
  mkdir -p src/app/pedidos/nuevo
  
  mkdir -p src/app/caja/apertura
  mkdir -p src/app/caja/cierre
  mkdir -p src/app/caja/cola
  mkdir -p src/app/caja/cobro
  
  mkdir -p src/app/inventario/stock
  mkdir -p src/app/inventario/movimientos
  mkdir -p src/app/inventario/toma
  
  mkdir -p src/app/reportes/ventas
  mkdir -p src/app/reportes/caja
  mkdir -p src/app/reportes/inventario
  
  mkdir -p src/app/admin/usuarios
  mkdir -p src/app/admin/roles
  mkdir -p src/app/admin/config
  
  mkdir -p src/app/shared/components/header
  mkdir -p src/app/shared/components/sidebar
  mkdir -p src/app/shared/components/layout
  mkdir -p src/app/shared/directives
  mkdir -p src/app/shared/pipes
  
  mkdir -p src/app/core/services
  mkdir -p src/app/core/models
  mkdir -p src/app/core/interceptors
  
  echo -e "${GREEN}✓ Estructura personalizada creada exitosamente${NC}"
}

# Crear archivos base
create_base_files() {
  echo -e "${BLUE}Creando archivos base...${NC}"
  
  # Crear environment.ts si no existe
  if [ ! -f "src/environments/environment.ts" ]; then
    echo "export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};" > src/environments/environment.ts
  else
    # Modificar environment.ts existente
    sed -i 's/production: false/production: false,\n  apiUrl: '\''http:\/\/localhost:3001\/api'\''/g' src/environments/environment.ts
  fi
  
  # Crear environment.prod.ts si no existe
  if [ ! -f "src/environments/environment.prod.ts" ]; then
    echo "export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api'
};" > src/environments/environment.prod.ts
  else
    # Modificar environment.prod.ts existente
    sed -i 's/production: true/production: true,\n  apiUrl: '\''https:\/\/api.tudominio.com\/api'\''/g' src/environments/environment.prod.ts
  fi
  
  # Crear servicio de autenticación
  echo "import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../../environments/environment';
import jwt_decode from 'jwt-decode';

export interface Usuario {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.initializeStorage();
  }

  async initializeStorage() {
    await this.storage.create();
    const token = await this.storage.get('token');
    if (token) {
      try {
        const user = this.getUserFromToken(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al analizar el token', error);
        await this.storage.remove('token');
      }
    }
  }

  private getUserFromToken(token: string): Usuario {
    try {
      const decoded: any = jwt_decode(token);
      return {
        id: decoded.id,
        username: decoded.username,
        roles: decoded.roles || [],
        permissions: decoded.permissions || []
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  login(username: string, password: string): Observable<Usuario> {
    return this.http.post<{ token: string }>(\`\${this.apiUrl}/auth/login\`, { username, password })
      .pipe(
        tap(async response => {
          await this.storage.set('token', response.token);
        }),
        map(response => {
          const user = this.getUserFromToken(response.token);
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  async logout() {
    await this.storage.remove('token');
    this.currentUserSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get('token');
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  verifyToken(): Observable<{ valid: boolean; user: Usuario }> {
    return this.http.get<{ valid: boolean; user: Usuario }>(\`\${this.apiUrl}/auth/verify-token\`);
  }
}" > src/app/core/services/auth.service.ts

  # Crear README personalizado
  echo "# OemPOS Frontend

Aplicación frontend para el sistema de Punto de Venta OemPOS, desarrollada con Ionic Angular.

## Requisitos

- Node.js v14 o superior
- npm v7 o superior
- Ionic CLI v6 o superior

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ionic serve
\`\`\`

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

La aplicación se comunica con el backend de OemPOS a través de una API REST. La configuración se encuentra en los archivos de entorno (\`environment.ts\` y \`environment.prod.ts\`).
" > README.md

  echo -e "${GREEN}✓ Archivos base creados exitosamente${NC}"
  
  # Instalar dependencias adicionales
  echo -e "${BLUE}Instalando dependencias adicionales...${NC}"
  npm install @ionic/storage-angular jwt-decode --save
  
  echo -e "${GREEN}✓ Dependencias instaladas${NC}"
}

# Función principal
main() {
  echo -e "${BLUE}===== Creando proyecto OemPOS Frontend con Ionic =====${NC}"
  
  check_ionic
  create_ionic_project
  create_custom_structure
  create_base_files
  
  echo -e "${GREEN}===== Proyecto creado con éxito =====${NC}"
  echo -e "${GREEN}Para iniciar el proyecto:${NC}"
  echo -e "  1. ${BLUE}cd frontend${NC}"
  echo -e "  2. ${BLUE}ionic serve${NC}"
}

# Ejecutar función principal
main