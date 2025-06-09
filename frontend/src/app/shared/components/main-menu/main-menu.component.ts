// src/app/shared/components/main-menu/main-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-menu',
  template: `
    <ion-menu contentId="main-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>OemPOS</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide="false" *ngFor="let p of appPages">
            <ion-item [routerLink]="p.url" routerDirection="root" 
                      [routerLinkActive]="'selected'" lines="none" detail="false"
                      *ngIf="checkPermission(p.permission)">
              <ion-icon slot="start" [name]="p.icon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <ion-item button (click)="logout()">
            <ion-icon slot="start" name="log-out"></ion-icon>
            <ion-label>Cerrar Sesión</ion-label>
          </ion-item>
        </ion-toolbar>
      </ion-footer>
    </ion-menu>
  `,
  styles: [`
    .selected {
      --background: var(--ion-color-light);
      --color: var(--ion-color-primary);
      font-weight: bold;
    }
  `]
})
export class MainMenuComponent implements OnInit {
  appPages = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: 'speedometer', permission: 'ver_reportes' },
    { title: 'Productos', url: '/productos', icon: 'cube', permission: 'ver_productos' },
    { title: 'Pedidos', url: '/pedidos', icon: 'receipt', permission: 'ver_ordenes' },
    { title: 'Caja', url: '/caja', icon: 'cash', permission: 'ver_caja' },
    { title: 'Inventario', url: '/inventory', icon: 'file-tray-full', permission: 'ver_inventario' },
    { title: 'Reportes', url: '/reportes', icon: 'stats-chart', permission: 'ver_reportes' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  checkPermission(permission: string): boolean {
    if (!permission) return true;
    return this.authService.hasPermission(permission);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}