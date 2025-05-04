// frontend/src/app/auth/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;
  returnUrl: string = '/';
  errorMessage: string = '';
  sessionExpired: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Obtener URL de retorno o usar el valor predeterminado
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Verificar si la sesión expiró
    this.sessionExpired = this.route.snapshot.queryParams['expired'] === 'true';
    
    if (this.sessionExpired) {
      this.presentToast('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }
    
    // Limpiar cualquier token previo
    this.authService.logout();
  }

  get f() { return this.loginForm.controls; }

  async onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
  
    if (this.loginForm.invalid) {
      // Marcar formulario como tocado para mostrar errores de validación
      Object.keys(this.f).forEach(key => {
        const control = this.f[key];
        control.markAsTouched();
      });
      return;
    }
  
    this.isLoading = true;
  
    try {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
        spinner: 'circles'
      });
      await loading.present();
  
      this.authService.login(
        this.loginForm.value.username,
        this.loginForm.value.password
      ).subscribe({
        next: async (user) => {
          await loading.dismiss();
          this.isLoading = false;
          
          // Verificar token almacenado
          const tokenValid = await this.authService.checkStoredToken();
          if (!tokenValid) {
            this.presentToast('Error: No se pudo guardar el token de autenticación');
            return;
          }
          
          // Redirigir según rol o a la URL de retorno si existe
          if (this.returnUrl !== '/') {
            console.log('Redirigiendo a URL de retorno:', this.returnUrl);
            this.router.navigateByUrl(this.returnUrl);
          } else {
            // Determinar ruta basada en rol
            const targetRoute = this.authService.navigateByRole();
            console.log('Redirigiendo según rol a:', targetRoute);
            this.router.navigateByUrl(targetRoute);
          }
        },
        error: async (error) => {
          console.error('Error en login:', error);
          await loading.dismiss();
          this.isLoading = false;
          
          // Manejar diferentes errores
          if (error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
          } else {
            this.errorMessage = error.error?.error || error.error?.message || 'Error desconocido';
          }
          
          this.presentErrorAlert(this.errorMessage);
        }
      });
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Ocurrió un error inesperado';
      this.presentErrorAlert(this.errorMessage);
      console.error('Error general en login:', error);
    }
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de inicio de sesión',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }
}