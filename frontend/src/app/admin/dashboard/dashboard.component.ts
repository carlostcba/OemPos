import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Dashboard Admin</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Bienvenido al Panel de Administración</ion-card-title>
          <ion-card-subtitle>Usuario: {{username}}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>El inicio de sesión fue exitoso. Este es el dashboard de administración.</p>
          <ion-button expand="block" color="primary" routerLink="/productos">
            Gestionar Productos
          </ion-button>
          <ion-button expand="block" color="secondary" (click)="checkToken()">
            Verificar Token
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class DashboardComponent implements OnInit {
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.username = user.username;
      }
    });
  
    // Verificar el token al cargar el componente
    this.authService.getToken().then(token => {
      console.log('Dashboard - Token actual:', token ? `${token.substring(0, 10)}...` : 'No hay token');
      
      if (token) {
        // Intenta una verificación manual
        this.authService.verifyTokenDirectly().subscribe({
          next: response => console.log('Verificación directa exitosa:', response),
          error: err => console.error('Verificación directa fallida:', err)
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  checkToken() {
    // Verificación directa del token para depuración
    this.authService.verifyTokenDirectly().subscribe({
      next: response => console.log('Token verificado exitosamente:', response),
      error: err => console.error('La verificación del token falló:', err)
    });
  }
}