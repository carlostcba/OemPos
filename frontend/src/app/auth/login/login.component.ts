import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { CoreModule } from '../../core/core.module';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CoreModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    // Inicializamos el formulario en el constructor
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Limpiar cualquier token previo
    this.authService.logout();
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.loginForm.controls; }

  async onSubmit() {
    this.submitted = true;
  
    // Si el formulario es inválido, detener
    if (this.loginForm.invalid) {
      return;
    }
  
    this.isLoading = true;
  
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circles'
    });
    await loading.present();
  
    this.authService.login(
      this.loginForm.value.username,
      this.loginForm.value.password
    ).subscribe({
      next: (user) => {
        console.log('Login exitoso, redirigiendo...', user);
        loading.dismiss();
        this.isLoading = false;
  
        // Verificar que el token se haya guardado correctamente
        this.authService.checkStoredToken().then(valid => {
          if (valid) {
            // Usar la función de navegación basada en rol
            const ruta = this.authService.navigateByRole();
            console.log('Redirigiendo a:', ruta);
            this.router.navigateByUrl(ruta);
          } else {
            console.error('El token no se guardó correctamente');
            this.presentErrorAlert('Error al guardar credenciales');
          }
        });
      },
      error: async (error) => {
        console.error('Error de login:', error);
        loading.dismiss();
        this.isLoading = false;
        this.presentErrorAlert('Usuario o contraseña incorrectos');
      }
    });
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de inicio de sesión',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}