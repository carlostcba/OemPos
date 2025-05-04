// src/app/pedidos/nuevo-pedido/nuevo-pedido.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../../productos/services/producto.service';
import { UiService } from '../../core/services/ui.service';

// Definir interfaz para categoría
interface Categoria {
  id: string;
  name: string;
}

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: ['./nuevo-pedido.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class NuevoPedidoComponent implements OnInit {
  seccionActual = 'nuevo';
  terminoBusqueda = '';
  categoriaSeleccionada = 'todas';
  categorias: Categoria[] = []; // Ahora tiene tipo correcto
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  itemsPedido: {producto: Producto, cantidad: number, subtotal: number}[] = [];
  nombreCliente = '';
  esPedidoAnticipado = false;
  metodoPago = 'efectivo';
  totalPedido = 0;

  constructor(
    private productoService: ProductoService,
    private alertController: AlertController,
    private router: Router,
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  toggleMenu() {
    console.log('Toggling menu'); // Para verificar que se está ejecutando
    this.uiService.toggleSideMenu();
  }

  cambiarSeccion(event: any) {
    this.seccionActual = event.detail.value;
  }

  cerrarSesion() {
    // Lógica para cerrar sesión
    this.router.navigate(['/login']);
  }

  cargarProductos() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.is_active);
        this.productosFiltrados = [...this.productos];
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
        this.mostrarError('Error al cargar productos');
      }
    });
  }

  cargarCategorias() {
    // Aquí cargarías las categorías desde un servicio
    // Por ahora usamos datos de ejemplo
    this.categorias = [
      { id: 'cat1', name: 'Panadería' },
      { id: 'cat2', name: 'Pastelería' },
      { id: 'cat3', name: 'Bebidas' }
    ];
  }

  buscarProductos() {
    if (!this.terminoBusqueda.trim()) {
      this.filtrarPorCategoria();
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(p => 
      p.name.toLowerCase().includes(termino) || 
      p.plu_code?.toLowerCase().includes(termino)
    );

    if (this.categoriaSeleccionada !== 'todas') {
      this.productosFiltrados = this.productosFiltrados.filter(
        p => p.category_id === this.categoriaSeleccionada
      );
    }
  }

  filtrarPorCategoria() {
    if (this.categoriaSeleccionada === 'todas') {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(
        p => p.category_id === this.categoriaSeleccionada
      );
    }

    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      this.productosFiltrados = this.productosFiltrados.filter(p => 
        p.name.toLowerCase().includes(termino) || 
        p.plu_code?.toLowerCase().includes(termino)
      );
    }
  }

  async agregarAlPedido(producto: Producto) {
    const alert = await this.alertController.create({
      header: 'Cantidad',
      inputs: [
        {
          name: 'cantidad',
          type: 'number',
          min: 1,
          value: 1
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            const cantidad = parseInt(data.cantidad, 10) || 1;
            const subtotal = producto.price * cantidad;
            
            this.itemsPedido.push({
              producto,
              cantidad,
              subtotal
            });
            
            this.calcularTotal();
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarItem(index: number) {
    this.itemsPedido.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalPedido = this.itemsPedido.reduce((total, item) => total + item.subtotal, 0);
  }

  async cancelarPedido() {
    if (this.itemsPedido.length === 0) {
      this.router.navigate(['/pedidos']);
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea cancelar este pedido?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: () => {
            this.itemsPedido = [];
            this.totalPedido = 0;
            this.nombreCliente = '';
            this.esPedidoAnticipado = false;
            this.metodoPago = 'efectivo';
            this.router.navigate(['/pedidos']);
          }
        }
      ]
    });

    await alert.present();
  }

  async crearPedido() {
    if (this.itemsPedido.length === 0) {
      this.mostrarError('Agregue al menos un producto al pedido');
      return;
    }

    // Aquí iría la lógica para crear el pedido en el backend
    // ...

    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Pedido creado exitosamente',
      buttons: ['OK']
    });

    await alert.present();
    
    // Reiniciar formulario
    this.itemsPedido = [];
    this.totalPedido = 0;
    this.nombreCliente = '';
    this.esPedidoAnticipado = false;
    this.metodoPago = 'efectivo';
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