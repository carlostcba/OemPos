import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode'; // Importación corregida

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
      const decoded: any = jwtDecode(token); // Usa la forma importada correctamente
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
}