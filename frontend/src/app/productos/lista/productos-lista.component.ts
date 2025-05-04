import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';

interface Producto {
  id: string;
  name: string;
  plu_code: string;
  price: number;
  is_weighable: boolean;
  unit_label: string;
  stock: number;
  track_stock: boolean;
  is_active: boolean;
  description: string;
  product_image_id?: string;
}

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Productos</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/productos/crear">
            <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar 
          placeholder="Buscar producto" 
          [(ngModel)]="searchTerm"
          (ionChange)="buscarProductos()"
          debounce="500"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item *ngFor="let producto of productos" [routerLink]="['/productos/editar', producto.id]">
          <ion-thumbnail slot="start" *ngIf="producto.product_image_id">
            <img src="assets/placeholder.png" alt="Producto">
          </ion-thumbnail>
          <ion-label>
            <h2>{{producto.name}}</h2>
            <p>{{producto.description || 'Sin descripción'}}</p>
            <p *ngIf="producto.track_stock">Stock: {{producto.stock}} {{producto.unit_label}}</p>
          </ion-label>
          <ion-note slot="end" color="primary">{{ producto.price | currency:'ARS':'symbol':'1.2-2' }}</ion-note>
          <ion-badge slot="end" color="success" *ngIf="producto.is_active">Activo</ion-badge>
          <ion-badge slot="end" color="medium" *ngIf="!producto.is_active">Inactivo</ion-badge>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll threshold="100px" (ionInfinite)="loadData($event)">
        <ion-infinite-scroll-content
          loadingSpinner="circular"
          loadingText="Cargando más productos...">
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <div *ngIf="productos.length === 0" class="ion-padding ion-text-center">
        <ion-icon name="cube" size="large" color="medium"></ion-icon>
        <p>No hay productos para mostrar</p>
      </div>
    </ion-content>
  `
})
export class ProductosListaComponent implements OnInit {
  productos: Producto[] = [];
  searchTerm: string = '';
  page: number = 1;
  hasMoreData: boolean = true;

  constructor(
    private productoService: ProductoService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  async cargarProductos(event?: any) {
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    
    await loading.present();
    
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        loading.dismiss();
        if (event) event.target.complete();
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
        loading.dismiss();
        if (event) event.target.complete();
        this.mostrarError('Error al cargar productos');
      }
    });
  }

  doRefresh(event: any) {
    this.page = 1;
    this.hasMoreData = true;
    this.cargarProductos(event);
  }

  loadData(event: any) {
    if (!this.hasMoreData) {
      event.target.complete();
      return;
    }
    
    this.page++;
    // Aquí se implementaría paginación en el backend
    // Por ahora simulamos que ya no hay más datos
    this.hasMoreData = false;
    event.target.complete();
  }

  buscarProductos() {
    // Implementar búsqueda con el backend
    console.log('Buscando:', this.searchTerm);
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