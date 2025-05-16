// frontend/src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

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
  private apiUrl = environment.apiUrl || 'http://localhost:3001/api';
  private storageReady = false;
  private tokenKey = 'auth_token'; // Usar una clave constante

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.initStorage();
  }

  async initStorage() {
    try {
      // Crear el storage
      await this.storage.create();
      this.storageReady = true;
      console.log('Storage inicializado correctamente');
      
      // Intentar recuperar el token
      await this.loadStoredToken();
    } catch (error) {
      console.error('Error al inicializar el almacenamiento', error);
    }
  }

  // Método separado para cargar el token almacenado
  private async loadStoredToken() {
    try {
      let token = null;
      
      // Intentar obtener token de IonicStorage
      if (this.storageReady) {
        token = await this.storage.get(this.tokenKey);
        console.log('Token obtenido de IonicStorage:', !!token);
      }
      
      // Si no se encuentra, intentar de localStorage
      if (!token) {
        token = localStorage.getItem(this.tokenKey);
        console.log('Token obtenido de localStorage:', !!token);
      }
      
      // Si hay token, decodificar y establecer usuario
      if (token) {
        try {
          const user = this.getUserFromToken(token);
          this.currentUserSubject.next(user);
          console.log('Usuario cargado de token almacenado:', user.username);
          return true;
        } catch (error) {
          console.error('Error al analizar el token almacenado', error);
          // Limpiar token inválido
          this.clearStoredToken();
        }
      }
    } catch (error) {
      console.error('Error al cargar token almacenado', error);
    }
    return false;
  }

  // Método para limpiar token de todas las ubicaciones
  private async clearStoredToken() {
    try {
      if (this.storageReady) {
        await this.storage.remove(this.tokenKey);
      }
      localStorage.removeItem(this.tokenKey);
      console.log('Token eliminado de todos los almacenamientos');
    } catch (error) {
      console.error('Error al limpiar token', error);
    }
  }

  public setCurrentUserFromToken(token: string): Usuario | null {
    try {
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
      console.log('✅ Usuario restaurado en AuthService:', user);
      return user;
    } catch (error) {
      console.warn('AuthService: Token inválido en setCurrentUserFromToken');
      return null;
    }
  }

  public getUserFromToken(token: string): Usuario {
    try {
      const decoded: any = jwtDecode(token);
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
          console.log('Login exitoso, token recibido');
          
          try {
            const token = response.token;
            
            // Guardar token en ambos lugares
            await this.storeToken(token);
            
            const user = this.getUserFromToken(token);
            this.currentUserSubject.next(user);
            console.log('Usuario decodificado:', user);
          } catch (error) {
            console.error('Error al almacenar token:', error);
          }
        }),
        map(response => {
          return this.getUserFromToken(response.token);
        }),
        catchError(error => {
          console.error('Error en el proceso de login:', error);
          return throwError(() => error);
        })
      );
  }

  // Método unificado para guardar token
  private async storeToken(token: string): Promise<void> {
    try {
      // Guardar en localStorage siempre como respaldo
      localStorage.setItem(this.tokenKey, token);
      console.log('Token guardado en localStorage');
      
      // También guardar en IonicStorage si está disponible
      if (this.storageReady) {
        await this.storage.set(this.tokenKey, token);
        console.log('Token guardado en IonicStorage');
      }
    } catch (error) {
      console.error('Error al guardar token:', error);
      throw error;
    }
  }

  async logout() {
    await this.clearStoredToken();
    this.currentUserSubject.next(null);
    console.log('Sesión cerrada correctamente');
  }

  async getToken(): Promise<string | null> {
    try {
      let token = null;
      
      // Primero intenta obtener de IonicStorage
      if (this.storageReady) {
        token = await this.storage.get(this.tokenKey);
        console.log('Token obtenido de IonicStorage:', token ? 'Sí' : 'No');
      }
      
      // Si no hay token en IonicStorage, intenta con localStorage
      if (!token) {
        token = localStorage.getItem(this.tokenKey);
        console.log('Token obtenido de localStorage:', token ? 'Sí' : 'No');
      }
      
      if (!token) {
        console.warn('No se encontró ningún token almacenado');
      }
      
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  // Método para navegar según el rol del usuario
  navigateByRole(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '/login';
    
    console.log('Determinando ruta para el rol:', user.roles);
    
    // Redireccionar según rol
    if (user.roles.includes('admin')) {
      console.log('Usuario es admin, redirigiendo a /admin/dashboard');
      return '/admin/dashboard';
    } else if (user.roles.includes('cajero')) {
      console.log('Usuario es cajero, redirigiendo a /caja');
      return '/caja';
    } else if (user.roles.includes('vendedor')) {
      console.log('Usuario es vendedor, redirigiendo a /pedidos');
      return '/pedidos';
    } else {
      // Rol desconocido, redirigir a página por defecto
      console.log('Rol desconocido, redirigiendo a /pedidos');
      return '/pedidos';
    }
  }

  verifyToken(): Observable<{ valid: boolean; user: Usuario }> {
    return this.http.get<{ valid: boolean; user: Usuario }>(`${this.apiUrl}/auth/verify-token`);
  }

  verifyTokenDirectly(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.error('No hay token para verificar');
          return throwError(() => new Error('No hay token'));
        }
        
        // Crear headers manualmente
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        
        console.log('Verificando token directo con headers:', headers.get('Authorization'));
        
        return this.http.get<any>(`${this.apiUrl}/auth/verify-token`, { headers });
      }),
      catchError(error => {
        console.error('Error en verificación directa:', error);
        return throwError(() => error);
      })
    );
  }

  async checkStoredToken(): Promise<boolean> {
    const token = await this.getToken();
    console.log('Existe token almacenado:', !!token);
    if (token) {
      console.log('El token comienza con:', token.substring(0, 10) + '...');
      try {
        const decoded = this.getUserFromToken(token);
        console.log('El token puede ser decodificado:', !!decoded);
        return true;
      } catch (error) {
        console.error('Error al decodificar token:', error);
        return false;
      }
    }
    return false;
  }
}