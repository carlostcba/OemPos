// frontend/src/app/core/interceptors/token.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar solicitudes de autenticación
    if (request.url.includes('/api/auth/login')) {
      return next.handle(request);
    }

    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          request = this.addToken(request, token);
        }
        
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            console.log('Error en la solicitud HTTP:', error.status, error.message);
            
            if (error.status === 401) {
              return this.handle401Error(request, next);
            } else {
              return throwError(() => error);
            }
          })
        );
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    console.log('Enviando solicitud a:', request.url);
    console.log('Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
    
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('Error 401 detectado - sesión caducada');
      
      // Redireccionar al login
      this.authService.logout().then(() => {
        this.router.navigate(['/login'], { 
          queryParams: { 
            expired: true,
            returnUrl: this.router.url 
          }
        });
      });
      
      return throwError(() => new Error('Sesión expirada'));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }
  }
}