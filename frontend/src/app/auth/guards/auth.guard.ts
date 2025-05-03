import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
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
    // Primero verificamos si tenemos un usuario en el BehaviorSubject
    return this.authService.currentUser.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          console.log('AuthGuard: Usuario ya autenticado', user.username);
          return of(true);
        }
        
        // Si no hay usuario, intentamos verificar el token con el backend
        return this.checkTokenWithBackend(state);
      }),
      catchError(error => {
        console.error('AuthGuard: Error general', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }

  private checkTokenWithBackend(state: RouterStateSnapshot): Observable<boolean> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.warn('AuthGuard: No hay token almacenado, redirigiendo a login');
          this.router.navigate(['/login']);
          return of(false);
        }
        
        console.log('AuthGuard: Verificando token con backend');
        
        // Usar método directo para verificar
        return this.authService.verifyTokenDirectly().pipe(
          map(result => {
            console.log('AuthGuard: Token verificado con éxito', result);
            return true;
          }),
          catchError(error => {
            console.error('AuthGuard: Error al verificar token', error);
            this.authService.logout();
            this.router.navigate(['/login']);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('AuthGuard: Error al verificar token', error);
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}