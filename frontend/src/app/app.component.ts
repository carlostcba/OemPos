// app.component.ts
import { Component, OnInit, HostBinding, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MenuController, Platform, IonicModule } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { UiService } from './core/services/ui.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { DomUtils } from './core/utils/dom-utils';
// Importar los iconos necesarios
import {
  homeOutline,
  cartOutline,
  cashOutline,
  cubeOutline,
  clipboardOutline,
  barChartOutline,
  settingsOutline,
  personOutline,
  keyOutline,
  logOutOutline,
  menuOutline,
  receiptOutline,
  swapHorizontalOutline,
  cardOutline,
  trashOutline,
  addOutline,
  refreshOutline,
  searchOutline,
  createOutline,
  personCircle,
  refresh,
  trash,
  create,
  add,
  close,
  saveOutline,
  lockOpenOutline,
  imageOutline,
  imagesOutline,
  images,
  save,
  cloudUpload,
  todayOutline,
  funnelOutline,
  timeOutline,
  hourglassOutline,
  syncCircle,
  listOutline,
  gridOutline,
  chevronDownOutline,
  checkmarkCircleOutline,
  arrowDownOutline,
  alertCircleOutline,
  chevronDown,
  flagOutline,
  calendarOutline,
  removeOutline,
  closeOutline,
  removeCircleOutline,
  addCircleOutline,
  syncCircleOutline

} from 'ionicons/icons';
// Importar addIcons para registrar los iconos
import { addIcons } from 'ionicons';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class AppComponent implements OnInit, AfterViewInit {
  appPages = [
    //{ title: 'Inicio', url: '/dashboard', icon: 'home-outline', roles: ['admin', 'cajero', 'vendedor'] },
    { title: 'Ordenes', url: '/orders', icon: 'cart-outline', roles: ['admin', 'vendedor'] },
    { title: 'Pedidos', url: '/pedidos', icon: 'time-outline', roles: ['admin', 'vendedor'] },
    { title: 'Caja', url: '/caja', icon: 'cash-outline', roles: ['admin', 'cajero'] },
    { title: 'Productos', url: '/productos', icon: 'cube-outline', roles: ['admin'] },
    { title: 'Inventario', url: '/inventory', icon: 'clipboard-outline', roles: ['admin'] },
    { title: 'Reportes', url: '/reportes', icon: 'bar-chart-outline', roles: ['admin'] },
    { title: 'Administración', url: '/admin/dashboard', icon: 'settings-outline', roles: ['admin'] }
  ];
  
  userMenuPages = [
    { title: 'Mi perfil', url: '/profile', icon: 'person-outline' },
    { title: 'Cambiar contraseña', url: '/change-password', icon: 'key-outline' },
    { title: 'Cerrar sesión', url: '/logout', icon: 'log-out-outline' }
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
    // Registrar todos los iconos utilizados en la aplicación
    addIcons({
      'home-outline': homeOutline,
      'cart-outline': cartOutline,
      'cash-outline': cashOutline,
      'cube-outline': cubeOutline,
      'clipboard-outline': clipboardOutline,
      'bar-chart-outline': barChartOutline,
      'settings-outline': settingsOutline,
      'person-outline': personOutline,
      'key-outline': keyOutline,
      'log-out-outline': logOutOutline,
      'menu-outline': menuOutline,
      'receipt-outline': receiptOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'card-outline': cardOutline,
      'trash-outline': trashOutline,
      'add-outline': addOutline,
      'refresh-outline': refreshOutline,
      'search-outline': searchOutline,
      'create-outline': createOutline,
      'person-circle': personCircle,
      'refresh': refresh,
      'trash': trash,
      'create': create,
      'add': add,
      'close': close,
      'save-outline': saveOutline,
      'lock-open-outline': lockOpenOutline,
      'image-outline': imageOutline,
      'images-outline': imagesOutline,
      'images': images,
      'save': save,
      'cloud-upload': cloudUpload,
      'funnel-outline': funnelOutline,
      'hourglass-outline': hourglassOutline,
      'today-outline': todayOutline,
      'sync-circle': syncCircle,
      'sync-circle-outline': syncCircleOutline,
      'list-outline': listOutline,
      'grid-outline': gridOutline,
      'chevron-down-outline': chevronDownOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'arrow-down-outline': arrowDownOutline,
      'alert-circle-outline': alertCircleOutline,
      'chevron-down': chevronDown,
      'calendar-outline': calendarOutline,
      'flag-outline': flagOutline,
      'close-outline': closeOutline,
      'remove-outline': removeOutline,
      'remove-circle-outline': removeCircleOutline,
      'add-circle-outline': addCircleOutline,
      'time-outline': timeOutline
    });
    
    this.initializeApp();
  }

  ngOnInit() {
    // Suscribirse a cambios en el usuario actual
      this.reconectarUsuario();
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

  private async reconectarUsuario() {
    const token = await this.authService.getToken();
    if (token) {
      const user = this.authService.setCurrentUserFromToken(token);
      if (user) {
        console.log('✅ Usuario restaurado desde AppComponent:', user.username);
      } else {
        console.warn('⚠️ Token inválido al iniciar la app');
      }
    } else {
      console.warn('⚠️ No se encontró token al iniciar la app');
    }
  }
}