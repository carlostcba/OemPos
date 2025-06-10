// frontend/src/app/auth/guards/permission.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermissions = route.data['requiredPermissions'] as string[];
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return of(true);
    }

    return this.authService.currentUser.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Admin tiene todos los permisos
        if (user.roles?.includes('admin')) {
          return true;
        }

        // Verificar si tiene al menos uno de los permisos requeridos
        const hasPermission = requiredPermissions.some(permission => 
          user.permissions?.includes(permission)
        );

        if (!hasPermission) {
          console.warn('Usuario sin permisos suficientes:', {
            required: requiredPermissions,
            user: user.permissions
          });
          // Redirigir a página de no autorizado o mostrar mensaje
          this.router.navigate(['/']);
          return false;
        }

        return true;
      }),
      catchError(error => {
        console.error('Error en PermissionGuard:', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}