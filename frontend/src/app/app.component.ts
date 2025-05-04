// app.component.ts
import { Component, OnInit, HostBinding, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MenuController, Platform, IonicModule } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { UiService } from './core/services/ui.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { DomUtils } from './core/utils/dom-utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class AppComponent implements OnInit, AfterViewInit {
  appPages = [
    { title: 'Inicio', url: '/dashboard', icon: 'home', roles: ['admin', 'cajero', 'vendedor'] },
    { title: 'Pedidos', url: '/pedidos', icon: 'cart', roles: ['admin', 'vendedor'] },
    { title: 'Caja', url: '/caja', icon: 'cash', roles: ['admin', 'cajero'] },
    { title: 'Productos', url: '/productos', icon: 'cube', roles: ['admin'] },
    { title: 'Inventario', url: '/inventario', icon: 'clipboard', roles: ['admin'] },
    { title: 'Reportes', url: '/reportes', icon: 'bar-chart', roles: ['admin'] },
    { title: 'Administración', url: '/admin/dashboard', icon: 'settings', roles: ['admin'] }
  ];
  
  userMenuPages = [
    { title: 'Mi perfil', url: '/profile', icon: 'person' },
    { title: 'Cambiar contraseña', url: '/change-password', icon: 'key' },
    { title: 'Cerrar sesión', url: '/logout', icon: 'log-out' }
  ];
  
  currentUsername: string = '';
  userRoles: string[] = [];
  isAuthenticated = false;
  
  @HostBinding('class.side-menu-hidden') menuHidden = false;

  constructor(
    private platform: Platform,
    public router: Router,
    private menu: MenuController,
    private authService: AuthService,
    private uiService: UiService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUsername = user?.username || '';
      this.userRoles = user?.roles || [];
    });
    
    // Cerrar menú en cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menu.close('main-menu');
        // Remover elementos no deseados después de cada navegación
        this.removeUnwantedElements();
      });
      
    // Suscribirse al estado del menú
    this.uiService.sideMenuOpen$.subscribe(isOpen => {
      this.menuHidden = !isOpen;
    });
  }

  ngAfterViewInit() {
    // Remover elementos no deseados después de que la vista se inicialice
    this.removeUnwantedElements();
  }

  // Método para eliminar elementos no deseados del DOM
  removeUnwantedElements() {
    DomUtils.removeElements([
      'ion-toolbar[color="primary"]:has(ion-title.ion-text-center)',
      'div[style*="background-color: #4285F4"]',
      'div[style*="background: #4285F4"]'
    ]);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Inicializar plugins de capacitor si fuera necesario
    });
  }
  
  hasRoleForPage(page: any): boolean {
    if (!page.roles || page.roles.length === 0) {
      return true;
    }
    
    return page.roles.some((role: string) => this.authService.hasRole(role));
  }
  
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
    this.menu.close('main-menu');
  }
  
  navigateTo(page: any) {
    if (page.url === '/logout') {
      this.logout();
      return;
    }
    
    this.router.navigateByUrl(page.url);
  }
}