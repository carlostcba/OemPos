// frontend/src/app/productos/lista/productos-lista.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Producto {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: any;
  is_active: boolean;
}

@Component({
  selector: 'app-productos-lista',
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ProductosListaComponent implements OnInit {
  productos: Producto[] = [];
  isLoading = false;
  error = false;
  errorMessage = 'Error al cargar productos';
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  async cargarProductos() {
    this.isLoading = true;
    this.error = false;
    
    this.http.get<Producto[]>(`${this.apiUrl}/products`).pipe(
      catchError(err => this.handleError(err)),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(data => {
      this.productos = data;
      console.log('Productos cargados:', this.productos.length);
    });
  }

  handleError(error: HttpErrorResponse) {
    this.error = true;
    
    if (error.status === 401) {
      this.errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
      // Redireccionar al login si es un error de autenticación
      this.router.navigate(['/login'], { queryParams: { expired: true } });
    } else if (error.status === 403) {
      this.errorMessage = 'No tiene permisos para acceder a esta información.';
    } else if (error.status === 0) {
      this.errorMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
    } else {
      this.errorMessage = `Error al cargar productos: ${error.error?.error || error.error?.message || error.message || 'Error desconocido'}`;
    }
    
    console.error('Error en la solicitud:', error);
    return throwError(() => error);
  }

  async reloadProducts() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando productos...'
    });
    await loading.present();
    
    this.http.get<Producto[]>(`${this.apiUrl}/products`).pipe(
      finalize(() => {
        loading.dismiss();
      }),
      catchError(err => {
        this.handleError(err);
        this.presentToast('Error al cargar productos: ' + (err.error?.message || err.message || 'Error desconocido'));
        return throwError(() => err);
      })
    ).subscribe(data => {
      this.productos = data;
      this.error = false;
    });
  }

  doRefresh(event: any) {
    this.http.get<Producto[]>(`${this.apiUrl}/products`).pipe(
      finalize(() => {
        event.target.complete();
      }),
      catchError(err => {
        this.handleError(err);
        this.presentToast('Error al refrescar: ' + (err.error?.message || err.message || 'Error desconocido'));
        return throwError(() => err);
      })
    ).subscribe(data => {
      this.productos = data;
      this.error = false;
    });
  }

  buscarProductos(event: any) {
    const searchTerm = event.detail.value;
    if (!searchTerm || searchTerm.trim() === '') {
      this.cargarProductos();
      return;
    }
    
    this.isLoading = true;
    this.http.get<Producto[]>(`${this.apiUrl}/products?search=${searchTerm}`).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(err => {
        this.handleError(err);
        this.presentToast('Error en la búsqueda');
        return throwError(() => err);
      })
    ).subscribe(data => {
      this.productos = data;
    });
  }

  async editarProducto(producto: Producto) {
    // Navegar a edición
    this.router.navigate(['/productos/editar', producto.id]);
  }

  async eliminarProducto(producto: Producto) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar el producto "${producto.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.http.delete(`${this.apiUrl}/products/${producto.id}`).pipe(
              catchError(err => {
                this.presentToast('Error al eliminar: ' + (err.error?.message || err.message || 'Error desconocido'));
                return throwError(() => err);
              })
            ).subscribe(() => {
              this.presentToast('Producto eliminado con éxito');
              this.cargarProductos(); // Recargar lista
            });
          }
        }
      ]
    });
    
    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}