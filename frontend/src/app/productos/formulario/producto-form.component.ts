// src/app/productos/formulario/producto-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { ProductoService, Producto } from '../services/producto.service';

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
        <ion-title>{{ isEditing ? 'Editar' : 'Crear' }} Producto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="productoForm" (ngSubmit)="guardarProducto()">
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
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Precio <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="price" type="number" min="0"></ion-input>
          <ion-note slot="error" *ngIf="productoForm.get('price')?.hasError('required') && (productoForm.get('price')?.dirty || productoForm.get('price')?.touched)">
            Este campo es requerido
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
          <ion-button expand="block" type="submit" [disabled]="productoForm.invalid">
            {{ isEditing ? 'Actualizar' : 'Crear' }} Producto
          </ion-button>
          <ion-button expand="block" fill="outline" color="medium" (click)="cancelar()">
            Cancelar
          </ion-button>
        </div>
      </form>
    </ion-content>
  `
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  isEditing: boolean = false;
  productoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.productoForm = this.fb.group({
      name: ['', Validators.required],
      plu_code: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      is_weighable: [false],
      unit_label: ['unidad'],
      stock: [0],
      track_stock: [true],
      is_active: [true],
      created_by: [''] // Se completará desde el servicio de autenticación
    });
  }

  ngOnInit() {
    this.productoId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.productoId;
    
    if (this.isEditing && this.productoId) {
      this.cargarProducto(this.productoId);
    }
  }

  async cargarProducto(id: string) {
    const loading = await this.loadingController.create({
      message: 'Cargando producto...'
    });
    
    await loading.present();
    
    this.productoService.getById(id).subscribe({
      next: (producto) => {
        this.productoForm.patchValue(producto);
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error al cargar producto', error);
        loading.dismiss();
        this.mostrarError('No se pudo cargar el producto');
        this.router.navigate(['/productos']);
      }
    });
  }

  async guardarProducto() {
    if (this.productoForm.invalid) {
      return;
    }
    
    const loading = await this.loadingController.create({
      message: this.isEditing ? 'Actualizando producto...' : 'Creando producto...'
    });
    
    await loading.present();
    
    const productoData = this.productoForm.value;
    
    if (this.isEditing && this.productoId) {
      this.productoService.update(this.productoId, productoData).subscribe({
        next: () => {
          loading.dismiss();
          this.mostrarExito('Producto actualizado exitosamente');
          this.router.navigate(['/productos']);
        },
        error: (error) => {
          console.error('Error al actualizar producto', error);
          loading.dismiss();
          this.mostrarError('Error al actualizar producto');
        }
      });
    } else {
      this.productoService.create(productoData).subscribe({
        next: () => {
          loading.dismiss();
          this.mostrarExito('Producto creado exitosamente');
          this.router.navigate(['/productos']);
        },
        error: (error) => {
          console.error('Error al crear producto', error);
          loading.dismiss();
          this.mostrarError('Error al crear producto');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }

  async mostrarExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}