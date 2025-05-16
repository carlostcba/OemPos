// frontend/src/app/auth/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { catchError, take, switchMap } from 'rxjs/operators';
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
    console.log('AuthGuard: Verificando acceso a ruta', state.url);

    return this.authService.currentUser.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          console.log('AuthGuard: Usuario ya autenticado', user.username);
          console.log('✅ Paso exitoso: acceso autorizado a', state.url);
          return of(true);
        }

        // Si no hay usuario en memoria, verificar token local
        return this.checkTokenLocally(state);
      }),
      catchError(error => {
        console.error('AuthGuard: Error general', error);
        this.redirectToLogin(state);
        return of(false);
      })
    );
  }

  private checkTokenLocally(state: RouterStateSnapshot): Observable<boolean> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.warn('AuthGuard: No se encontró token, redirigiendo');
          this.redirectToLogin(state);
          return of(false);
        }

        const user = this.authService.setCurrentUserFromToken(token);
        if (user) {
          console.log('AuthGuard: Token válido localmente. Usuario:', user.username);
          return of(true);
        } else {
          console.warn('AuthGuard: Token inválido, redirigiendo');
          this.redirectToLogin(state);
          return of(false);
        }
      }),
      catchError(error => {
        console.error('AuthGuard: Error al verificar token localmente', error);
        this.redirectToLogin(state);
        return of(false);
      })
    );
  }
  
  private redirectToLogin(state: RouterStateSnapshot) {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
