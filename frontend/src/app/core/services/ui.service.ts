// Crear un nuevo servicio para control de UI: core/services/ui.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private sideMenuOpenSubject = new BehaviorSubject<boolean>(true);
  public sideMenuOpen$ = this.sideMenuOpenSubject.asObservable();

  constructor(private menuCtrl: MenuController) {
    // Verificar el tamaño inicial de la pantalla
    this.checkScreenSize();
    
    // Escuchar cambios en el tamaño de la pantalla
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  private checkScreenSize() {
    // En pantallas pequeñas, cerrar el menú por defecto
    if (window.innerWidth < 768) {
      this.closeSideMenu();
    }
  }

  toggleSideMenu() {
    console.log('UiService toggling menu');
    const currentValue = this.sideMenuOpenSubject.value;
    this.sideMenuOpenSubject.next(!currentValue);
    
    if (!currentValue) {
      console.log('Opening menu');
      this.menuCtrl.open('main-menu');
    } else {
      console.log('Closing menu');
      this.menuCtrl.close('main-menu');
    }
  }

  openSideMenu() {
    this.sideMenuOpenSubject.next(true);
    this.menuCtrl.open('main-menu');
  }

  closeSideMenu() {
    this.sideMenuOpenSubject.next(false);
    this.menuCtrl.close('main-menu');
  }
}