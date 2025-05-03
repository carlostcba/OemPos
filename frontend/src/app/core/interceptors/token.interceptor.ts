import { Injectable } from '@angular/core';
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
    // El problema está aquí - necesitamos asegurarnos de que el token se obtenga correctamente
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          console.log('Enviando solicitud con token:', token.substring(0, 10) + '...');
          // Cambiando el formato del encabezado
          request = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
          });
        } else {
          console.warn('No hay token disponible para la solicitud a:', request.url);
        }
        
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.log('Error 401: Token expirado o inválido. Mensaje:', error.error);
              this.authService.logout();
              this.router.navigate(['/login']);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
}