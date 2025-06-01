// src/app/orders/guards/order-details.guard.ts

import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AlertController, LoadingController } from '@ionic/angular';

import { OrderService } from '../services/order.service';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailsGuard implements CanActivate {

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const orderId = route.paramMap.get('id');
    
    if (!orderId) {
      console.error('❌ No se proporcionó ID de orden');
      return this.handleError('ID de orden requerido');
    }

    // Validar formato UUID (opcional pero recomendado)
    if (!this.isValidUUID(orderId)) {
      console.error('❌ Formato de ID de orden inválido:', orderId);
      return this.handleError('Formato de ID de orden inválido');
    }

    return this.validateOrderAccess(orderId);
  }

  private async validateOrderAccess(orderId: string): Promise<boolean | UrlTree> {
    try {
      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Verificando orden...',
        duration: 10000 // Timeout de 10 segundos
      });
      await loading.present();

      // Verificar autenticación
      const isAuthenticated = this.authService.isAuthenticated();
      if (!isAuthenticated) {
        await loading.dismiss();
        console.error('❌ Usuario no autenticado');
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: `/orders/details/${orderId}` }
        });
      }

      // Obtener usuario actual
      const currentUser = await this.authService.currentUser.pipe(
        map(user => user),
        catchError(() => of(null))
      ).toPromise();

      if (!currentUser) {
        await loading.dismiss();
        console.error('❌ No se pudo obtener información del usuario');
        return this.router.createUrlTree(['/login']);
      }

      // Verificar permisos básicos
      if (!this.hasOrderViewPermission(currentUser)) {
        await loading.dismiss();
        await this.showErrorAlert(
          'Sin permisos',
          'No tiene permisos para ver detalles de órdenes'
        );
        return this.router.createUrlTree(['/orders']);
      }

      // Verificar existencia de la orden
      const orderExists = await this.orderService.getOrderById(orderId).pipe(
        map(order => {
          if (!order) {
            throw new Error('Orden no encontrada');
          }
          return this.canUserAccessOrder(order, currentUser);
        }),
        catchError(error => {
          console.error('❌ Error al verificar orden:', error);
          if (error.status === 404) {
            throw new Error('Orden no encontrada');
          }
          throw new Error('Error al cargar la orden');
        })
      ).toPromise();

      await loading.dismiss();

      if (!orderExists) {
        await this.showErrorAlert(
          'Acceso denegado',
          'No tiene permisos para ver esta orden específica'
        );
        return this.router.createUrlTree(['/orders']);
      }

      console.log('✅ Acceso a orden autorizado:', orderId);
      return true;

    } catch (error: any) {
      // Asegurar que el loading se cierre
      try {
        const loading = await this.loadingController.getTop();
        if (loading) {
          await loading.dismiss();
        }
      } catch (e) {
        // Ignorar errores de loading
      }

      console.error('❌ Error en guard de orden:', error);
      
      if (error.message === 'Orden no encontrada') {
        await this.showErrorAlert(
          'Orden no encontrada',
          'La orden solicitada no existe o ha sido eliminada'
        );
        return this.router.createUrlTree(['/orders']);
      }

      await this.showErrorAlert(
        'Error',
        'Ocurrió un error al verificar la orden. Intente nuevamente.'
      );
      return this.router.createUrlTree(['/orders']);
    }
  }

  private canUserAccessOrder(order: any, user: any): boolean {
    // Admins pueden ver todas las órdenes
    if (user.roles?.includes('admin')) {
      return true;
    }

    // Sellers pueden ver sus propias órdenes
    if (user.roles?.includes('seller') || user.roles?.includes('vendedor')) {
      return order.created_by === user.id;
    }

    // Cashiers pueden ver todas las órdenes (para procesamiento)
    if (user.roles?.includes('cashier') || user.roles?.includes('cajero')) {
      return true;
    }

    // Por defecto, denegar acceso
    return false;
  }

  private hasOrderViewPermission(user: any): boolean {
    // Verificar roles
    const allowedRoles = ['admin', 'seller', 'cashier', 'vendedor', 'cajero'];
    if (user.roles?.some((role: string) => allowedRoles.includes(role))) {
      return true;
    }

    // Verificar permisos específicos
    const allowedPermissions = ['ver_ordenes', 'gestionar_ordenes', 'procesar_pagos'];
    if (user.permissions?.some((permission: string) => allowedPermissions.includes(permission))) {
      return true;
    }

    return false;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private async handleError(message: string): Promise<UrlTree> {
    await this.showErrorAlert('Error', message);
    return this.router.createUrlTree(['/orders']);
  }

  private async showErrorAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }
}