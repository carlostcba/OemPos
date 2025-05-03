import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    // Podemos reinicializar aquí también si es necesario
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
    ).subscribe(
      (user) => {
        loading.dismiss();
        this.isLoading = false;

        // Redirigir según el rol del usuario
        if (user.roles.includes('admin')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (user.roles.includes('cajero')) {
          this.router.navigate(['/caja']);
        } else {
          this.router.navigate(['/pedidos']);
        }
      },
      async (error) => {
        loading.dismiss();
        this.isLoading = false;
        
        console.error('Error de login:', error);
        
        const alert = await this.alertController.create({
          header: 'Error de inicio de sesión',
          message: 'Usuario o contraseña incorrectos. Por favor intente nuevamente.',
          buttons: ['OK']
        });

        await alert.present();
      }
    );
  }
}