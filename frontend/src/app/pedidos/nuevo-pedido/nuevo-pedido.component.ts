// src/app/pedidos/nuevo-pedido/nuevo-pedido.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, IonContent } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../../productos/services/producto.service';
import { UiService } from '../../core/services/ui.service';

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
export class NuevoPedidoComponent implements OnInit, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  
  seccionActual = 'nuevo';
  terminoBusqueda = '';
  categoriaSeleccionada = 'todas';
  categorias: Categoria[] = [];
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

  ngAfterViewInit() {
    // Asegurarnos de que el contenido se renderice correctamente
    setTimeout(() => {
      this.content.scrollToTop();
      this.fixAriaHiddenIssues();
    }, 100);
  }

  fixAriaHiddenIssues() {
    setTimeout(() => {
      // Remover aria-hidden de elementos que podrían afectar el scroll
      const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
      elementsWithAriaHidden.forEach(el => {
        // Solo remover aria-hidden de los contenedores principales que podrían afectar el scroll
        if (el.classList.contains('catalogo-productos') || 
            el.classList.contains('detalle-items') || 
            el.classList.contains('ion-content') || 
            el.parentElement?.classList.contains('ion-content')) {
          el.removeAttribute('aria-hidden');
          console.log('Aria-hidden removido de:', el);
        }
      });
    }, 500);
  }

  toggleMenu() {
    this.uiService.toggleSideMenu();
  }

  cambiarSeccion(event: any) {
    this.seccionActual = event.detail.value;
    // Resetear el scroll cuando se cambia de sección
    setTimeout(() => {
      this.content.scrollToTop();
      this.fixAriaHiddenIssues();
    }, 100);
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
    // Datos de ejemplo
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

    // Lógica para crear el pedido en el backend
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