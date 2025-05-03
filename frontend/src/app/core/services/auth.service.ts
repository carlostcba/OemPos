import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
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
  private storageReady = false; // Agregar esta propiedad que faltaba

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
      
      // Intentar recuperar el token
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
    } catch (error) {
      console.error('Error al inicializar el almacenamiento', error);
    }
  }

  private getUserFromToken(token: string): Usuario {
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
          console.log('Login exitoso, token recibido:', response.token.slice(0, 10) + '...');
          
          if (this.storageReady) {
            await this.storage.set('token', response.token);
          } else {
            console.warn('Storage no inicializado, guardando token en localStorage');
            localStorage.setItem('token', response.token);
          }
          
          const user = this.getUserFromToken(response.token);
          this.currentUserSubject.next(user);
          console.log('Usuario decodificado:', user);
        }),
        map(response => {
          return this.getUserFromToken(response.token);
        })
      );
  }

  async logout() {
    if (this.storageReady) {
      await this.storage.remove('token');
    } else {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  async getToken(): Promise<string | null> {
    if (this.storageReady) {
      return await this.storage.get('token');
    } 
    // Fallback a localStorage si el storage no está listo
    return localStorage.getItem('token');
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
}