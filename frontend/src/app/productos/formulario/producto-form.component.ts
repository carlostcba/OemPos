// src/app/productos/formulario/producto-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { ProductoService } from '../services/producto.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/productos"></ion-back-button>
        </ion-buttons>
        <ion-title>Crear Producto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <form [formGroup]="productoForm" (ngSubmit)="crearProducto()">
        <ion-item>
          <ion-label position="stacked">Nombre <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="name" type="text"></ion-input>
          <ion-note slot="error" *ngIf="productoForm.get('name')?.hasError('required') && (productoForm.get('name')?.dirty || productoForm.get('name')?.touched)">
            Este campo es requerido
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Código PLU</ion-label>
          <ion-input formControlName="plu_code" type="text" maxlength="4"></ion-input>
          <ion-note slot="error" *ngIf="productoForm.get('plu_code')?.hasError('pattern') && (productoForm.get('plu_code')?.dirty || productoForm.get('plu_code')?.touched)">
            El código PLU debe ser numérico
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Precio <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="price" type="number" min="0.01" step="0.01"></ion-input>
          <ion-note slot="error" *ngIf="productoForm.get('price')?.hasError('required') && (productoForm.get('price')?.dirty || productoForm.get('price')?.touched)">
            Este campo es requerido
          </ion-note>
          <ion-note slot="error" *ngIf="productoForm.get('price')?.hasError('min') && (productoForm.get('price')?.touched)">
            El precio debe ser mayor a 0
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-textarea formControlName="description" rows="3"></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label>Seguimiento de stock</ion-label>
          <ion-toggle formControlName="track_stock"></ion-toggle>
        </ion-item>

        <ion-item *ngIf="productoForm.get('track_stock')?.value">
          <ion-label position="stacked">Stock inicial</ion-label>
          <ion-input formControlName="stock" type="number" min="0"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>Es pesable</ion-label>
          <ion-toggle formControlName="is_weighable"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Unidad de medida</ion-label>
          <ion-select formControlName="unit_label">
            <ion-select-option value="unidad">Unidad</ion-select-option>
            <ion-select-option value="kg">Kilogramo</ion-select-option>
            <ion-select-option value="g">Gramo</ion-select-option>
            <ion-select-option value="l">Litro</ion-select-option>
            <ion-select-option value="ml">Mililitro</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>Activo</ion-label>
          <ion-toggle formControlName="is_active"></ion-toggle>
        </ion-item>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="productoForm.invalid || loading || !currentUser">
            <ion-spinner *ngIf="loading" name="crescent"></ion-spinner>
            {{ loading ? 'Creando...' : 'Crear Producto' }}
          </ion-button>
          <ion-button expand="block" fill="outline" color="medium" (click)="cancelar()" [disabled]="loading">
            Cancelar
          </ion-button>
        </div>
      </form>

      <!-- Mostrar información de debug -->
      <ion-card class="ion-margin-top" *ngIf="debugInfo">
        <ion-card-header>
          <ion-card-title>Debug Info</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <pre>{{ debugInfo | json }}</pre>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  loading = false;
  currentUser: any = null;
  debugInfo: any = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.productoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      plu_code: ['', [Validators.pattern(/^\d+$/)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      is_weighable: [false],
      unit_label: ['unidad'],
      stock: [0, [Validators.min(0)]],
      track_stock: [true],
      is_active: [true]
    });
  }

  ngOnInit() {
    // Obtener usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Usuario actual en formulario:', user);
      
      if (!user) {
        console.log('❌ No hay usuario autenticado, redirigiendo al login');
        this.router.navigate(['/login']);
      }
    });

    // Configurar validaciones dinámicas para stock
    this.productoForm.get('track_stock')?.valueChanges.subscribe(trackStock => {
      const stockControl = this.productoForm.get('stock');
      if (trackStock) {
        stockControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        stockControl?.clearValidators();
        stockControl?.setValue(0);
      }
      stockControl?.updateValueAndValidity();
    });
  }

  async crearProducto() {
    console.log('🚀 Iniciando creación de producto...');
    
    if (this.productoForm.invalid) {
      this.markFormGroupTouched(this.productoForm);
      await this.mostrarAlerta('Error', 'Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    if (!this.currentUser?.id) {
      await this.mostrarAlerta('Error', 'Usuario no autenticado. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    const loading = await this.loadingController.create({
      message: 'Creando producto...'
    });

    await loading.present();

    try {
      // Preparar datos del producto
      const formData = this.productoForm.value;
      const productoData = {
        name: formData.name.trim(),
        plu_code: formData.plu_code || null,
        price: parseFloat(formData.price),
        description: formData.description?.trim() || null,
        is_weighable: formData.is_weighable || false,
        unit_label: formData.unit_label || 'unidad',
        stock: formData.track_stock ? parseFloat(formData.stock || 0) : 0,
        track_stock: formData.track_stock !== false,
        is_active: formData.is_active !== false,
        created_by: this.currentUser.id
      };

      console.log('📝 Datos a enviar al servidor:', productoData);

      // Actualizar info de debug
      this.debugInfo = {
        usuario: this.currentUser,
        datos: productoData,
        timestamp: new Date().toISOString()
      };

      const resultado = await this.productoService.create(productoData).toPromise();
      
      console.log('✅ Producto creado exitosamente:', resultado);
      
      await loading.dismiss();
      await this.mostrarAlerta('Éxito', 'Producto creado exitosamente');
      this.router.navigate(['/productos']);

    } catch (error: any) {
      console.error('❌ Error completo al crear producto:', error);
      await loading.dismiss();
      
      let mensaje = 'No se pudo crear el producto';
      
      // Manejar diferentes tipos de error
      if (error.status === 400) {
        mensaje = error.error?.error || 'Datos inválidos';
      } else if (error.status === 401) {
        mensaje = 'No autorizado. Por favor inicie sesión nuevamente.';
        this.router.navigate(['/login']);
        return;
      } else if (error.status === 403) {
        mensaje = 'No tiene permisos para crear productos';
      } else if (error.error?.error) {
        mensaje = error.error.error;
      } else if (error.error?.message) {
        mensaje = error.error.message;
      } else if (error.message) {
        mensaje = error.message;
      }
      
      // Agregar detalles específicos si están disponibles
      if (error.error?.details) {
        mensaje += `\n\nDetalles: ${error.error.details}`;
      }
      
      // Actualizar info de debug con el error
      this.debugInfo = {
        usuario: this.currentUser,
        error: {
          status: error.status,
          message: error.message,
          errorObj: error.error,
          fullError: error
        },
        timestamp: new Date().toISOString()
      };
      
      await this.mostrarAlerta('Error', mensaje);
    } finally {
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}