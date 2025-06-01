import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ProductoEditarModal } from '../modal/producto-editar.modal';
import { ProductoCargarModal } from '../modal/producto-cargar.modal';
import { CargaImagenesModal } from '../../shared/services/carga-imagen.modal';
import { ImagenService } from '../../shared/services/imagen.service';
import { ProductoService } from '../services/producto.service';

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
  

  // Variables de paginación
  desde: number = 0;
  hasta: number = 0;
  searchTerm: string = '';
  currentPage: number = 1;
  totalProducts: number = 0;
  pageSize: number = 10;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router,
    private modalCtrl: ModalController,
    private imagenService: ImagenService,
    private productoService: ProductoService  // Aseguramos que el servicio está inyectado
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

// Método para recargar productos con la paginación actual
async cargarProductos() {
  this.isLoading = true;
  this.error = false;

  this.productoService.search(this.searchTerm, this.currentPage, this.pageSize).subscribe(
    data => {
      this.productos = data.products; // ✅ tu propiedad real
      console.log('Respuesta completa:', data);
      this.totalProducts = data.total;

      // ✅ Calcular rango visible
      this.desde = (this.currentPage - 1) * this.pageSize + 1;
      this.hasta = Math.min(this.currentPage * this.pageSize, this.totalProducts);

      this.isLoading = false;
    },
    error => {
      this.handleError(error);
      this.isLoading = false;
    }
  );
}

  handleError(error: HttpErrorResponse) {
    this.error = true;

    if (error.status === 401) {
      this.errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
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

// Recarga los productos al hacer clic en "Recargar"
async reloadProducts() {
  const loading = await this.loadingCtrl.create({
    message: 'Cargando productos...'
  });
  await loading.present();

  try {
    await this.cargarProductos();  // reutiliza la lógica ya paginada y completa
  } finally {
    loading.dismiss();
  }
}

  // Función de búsqueda con paginación
  buscarProductos(event: any) {
    const searchTerm = event.detail.value;
    this.searchTerm = searchTerm;
    this.currentPage = 1; // Vuelve a la primera página si cambia la búsqueda

    this.cargarProductos();  // Recarga productos al escribir

    if (!searchTerm || searchTerm.trim() === '') {
      this.cargarProductos(); // Recarga sin filtro si el campo de búsqueda está vacío
    }
  }

  // Método para manejar la paginación
  cambiarPagina(page: number) {
    if (page < 1 || page * this.pageSize > this.totalProducts) return;

    this.currentPage = page;
    this.cargarProductos();  // Recarga los productos con la nueva página
  }

  // Método para manejar la edición de productos
  async editarProducto(producto: Producto) {
    const modal = await this.modalCtrl.create({
      component: ProductoEditarModal,
      componentProps: { producto },

      cssClass: ['modal-md', 'custom-centered-modal'],
      backdropDismiss: true,
      showBackdrop: true,
      keyboardClose: true,
      id: 'producto-edit-modal',
      htmlAttributes: {
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        'role': 'dialog'
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.actualizado) {
      const index = this.productos.findIndex(p => p.id === data.actualizado.id);
      if (index !== -1) {
        this.productos[index] = data.actualizado;
      }
    }
  }

  // Método para eliminar productos
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
              this.cargarProductos();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Método para mostrar mensajes de toast
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Método para abrir el modal de carga de imágenes
  async abrirCargaImagenesModal() {
    const modal = await this.modalCtrl.create({
      component: CargaImagenesModal,
      componentProps: {
        elementos: this.productos,
        campoAsociacion: 'name'
      },
      cssClass: 'modal-lg'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.recargado) {
      this.cargarProductos();
    }
  }

  // Método para abrir el modal de creación de producto
  async abrirCrearProductoModal() {
    const modal = await this.modalCtrl.create({
      component: ProductoCargarModal,
      cssClass: 'modal-lg' // clase unificada por tamaño
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.creado) {
      this.cargarProductos();
    }
  }

  // Método para refrescar la lista con el pull-to-refresh
  doRefresh(event: any) {
    this.cargarProductos();  // Recarga los productos cuando se hace un refresh
    event.target.complete();  // Completa el refresco
  }
}
