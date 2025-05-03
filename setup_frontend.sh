#!/bin/bash

# Script para crear la estructura de directorios del frontend de OemPOS

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para crear directorios y archivos base
create_directories() {
  echo -e "${BLUE}Creando estructura de directorios para OemPOS frontend...${NC}"

  # Directorio raíz del frontend (ya debe existir)
  if [ ! -d "frontend" ]; then
    mkdir -p frontend
    echo -e "${GREEN}✓ Creado directorio frontend${NC}"
  else
    echo -e "${GREEN}✓ El directorio frontend ya existe${NC}"
  fi

  # Cambiar al directorio frontend
  cd frontend

  # Estructura principal
  mkdir -p e2e
  mkdir -p resources/android
  mkdir -p resources/ios
  mkdir -p src/app
  mkdir -p src/assets/icons
  mkdir -p src/assets/images
  mkdir -p src/assets/fonts
  mkdir -p src/environments
  mkdir -p src/theme

  # Módulos
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

  echo -e "${GREEN}✓ Estructura de directorios creada exitosamente${NC}"
}

# Crear archivos base
create_base_files() {
  echo -e "${BLUE}Creando archivos base...${NC}"

  # Archivos de configuración
  echo '{
  "name": "oempos-frontend",
  "version": "0.0.1",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  "private": true,
  "dependencies": {
    "@angular/common": "^15.0.0",
    "@angular/core": "^15.0.0",
    "@angular/forms": "^15.0.0",
    "@angular/platform-browser": "^15.0.0",
    "@angular/platform-browser-dynamic": "^15.0.0",
    "@angular/router": "^15.0.0",
    "@ionic/angular": "^6.0.0",
    "@ionic/storage-angular": "^3.0.0",
    "rxjs": "~7.5.0",
    "jwt-decode": "^3.1.2",
    "tslib": "^2.3.0",
    "zone.js": "~0.11.4"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^15.0.0",
    "@angular-eslint/builder": "^15.0.0",
    "@angular-eslint/eslint-plugin": "^15.0.0",
    "@angular-eslint/eslint-plugin-template": "^15.0.0",
    "@angular-eslint/template-parser": "^15.0.0",
    "@angular/cli": "^15.0.0",
    "@angular/compiler": "^15.0.0",
    "@angular/compiler-cli": "^15.0.0",
    "@ionic/angular-toolkit": "latest",
    "@types/jasmine": "~4.0.0",
    "@types/node": "^12.11.1",
    "@typescript-eslint/eslint-plugin": "5.3.0",
    "@typescript-eslint/parser": "5.3.0",
    "eslint": "^7.6.0",
    "jasmine-core": "~4.3.0",
    "jasmine-spec-reporter": "~5.0.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.1.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.0.0",
    "typescript": "~4.8.4"
  }
}' > package.json

  echo '{
  "name": "oempos",
  "integrations": {
    "capacitor": {}
  },
  "type": "angular"
}' > ionic.config.json

  echo '{
  "appId": "com.oempos.app",
  "appName": "OemPOS",
  "bundledWebRuntime": false,
  "npmClient": "npm",
  "webDir": "www",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "cordova": {}
}' > capacitor.config.json

  # Archivos de entorno
  echo "export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};" > src/environments/environment.ts

  echo "export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api'
};" > src/environments/environment.prod.ts

  # Crear archivos principales de la aplicación
  echo "import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { TokenInterceptor } from './core/interceptors/token.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}" > src/app/app.module.ts

  echo "import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'productos',
    loadChildren: () => import('./productos/productos.module').then(m => m.ProductosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'caja',
    loadChildren: () => import('./caja/caja.module').then(m => m.CajaModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'inventario',
    loadChildren: () => import('./inventario/inventario.module').then(m => m.InventarioModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}" > src/app/app-routing.module.ts

  echo "import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {}
}" > src/app/app.component.ts

  echo "<ion-app>
  <ion-router-outlet></ion-router-outlet>
</ion-app>" > src/app/app.component.html

  echo "" > src/app/app.component.scss

  # Crear archivos para servicios centrales
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
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/login`, { username, password })
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
    return this.http.get<{ valid: boolean; user: Usuario }>(`${this.apiUrl}/auth/verify-token`);
  }
}" > src/app/core/services/auth.service.ts

  echo "import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
  id: string;
  name: string;
  plu_code: string;
  price: number;
  is_weighable: boolean;
  unit_label: string;
  stock: number;
  track_stock: boolean;
  allow_discount: boolean;
  is_active: boolean;
  description?: string;
  category?: any;
  subcategory?: any;
  image?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProducto(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}" > src/app/core/services/producto.service.ts

  # Crear módulos base
  echo "import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }" > src/app/auth/auth.module.ts

  echo "import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: []
})
export class CoreModule { }" > src/app/core/core.module.ts

  echo "import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: []
})
export class SharedModule { }" > src/app/shared/shared.module.ts

  # Crear guards básicos
  echo "import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.verifyToken().pipe(
      map(result => {
        if (result.valid) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(error => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}" > src/app/auth/guards/auth.guard.ts

  # Crear interceptor JWT
  echo "import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: \`Bearer \${token}\`
            }
          });
        }
        
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Token expirado o inválido
              this.authService.logout();
              this.router.navigate(['/login']);
            }
            return throwError(error);
          })
        );
      })
    );
  }
}" > src/app/core/interceptors/token.interceptor.ts

  # Crear archivo README.md con información básica
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
npm start
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
}

# Función principal
main() {
  echo -e "${BLUE}===== Generando estructura de proyecto OemPOS Frontend =====${NC}"
  
  create_directories
  create_base_files
  
  echo -e "${GREEN}===== Estructura creada con éxito =====${NC}"
  echo -e "${GREEN}Para iniciar el proyecto:${NC}"
  echo -e "  1. ${BLUE}cd frontend${NC}"
  echo -e "  2. ${BLUE}npm install${NC}"
  echo -e "  3. ${BLUE}ionic serve${NC}"
}

# Ejecutar función principal
main