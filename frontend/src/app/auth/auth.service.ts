// frontend/src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface User {
  id: string;
  username: string;
  roles: string[];
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {
    // Cargar usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          // Guardar token y datos del usuario
          const user: User = {
            id: response.id,
            username: response.username,
            roles: response.roles || [],
            token: response.token
          };
          
          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(user);
        })
      );
  }

  logout() {
    // Eliminar usuario del localStorage
    localStorage.removeItem('currentUser');
    // Establecer el currentUserSubject a null
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}