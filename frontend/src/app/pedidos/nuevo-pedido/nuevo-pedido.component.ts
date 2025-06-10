// src/app/pedidos/nuevo-pedido/nuevo-pedido.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, IonContent } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../../productos/services/producto.service';
import { UiService } from '../../core/services/ui.service';
import { PedidosListaComponent } from '../pedidos-lista/pedidos-lista.component';

interface Categoria {
  id: string;
  name: string;
}

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: ['./nuevo-pedido.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    PedidosListaComponent
  ]
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

  // Modal para productos pesables
  showPesoModal = false;
  productoSeleccionado: Producto | null = null;
  pesoTemporal = '0.00';

  private holdInterval: any;
  private holdStart = 0;

  getUnitLabel(producto?: Producto | null): string {
    if (!producto) {
      return '';
    }

    const label = producto.unit_label?.trim();

    if (producto.is_weighable) {
      if (!label || label.toLowerCase() === 'unidad') {
        return 'kg';
      }
      return label;
    }

    return label || 'unidad';
  }

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
    setTimeout(() => {
      this.content.scrollToTop();
      this.fixAriaHiddenIssues();
    }, 100);
  }

  fixAriaHiddenIssues() {
    setTimeout(() => {
      const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
      elementsWithAriaHidden.forEach(el => {
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
    if (producto.is_weighable) {
      this.productoSeleccionado = producto;
      this.pesoTemporal = '0.00';
      this.showPesoModal = true;
    } else {
      const existente = this.itemsPedido.find(item => item.producto.id === producto.id);

      if (existente) {
        existente.cantidad += 1;
        existente.subtotal = existente.cantidad * producto.price;
      } else {
        this.itemsPedido.push({
          producto,
          cantidad: 1,
          subtotal: producto.price
        });
      }

      this.calcularTotal();
    }
  }

  ajustarPeso(delta: number) {
    let peso = parseFloat(this.pesoTemporal) || 0;
    peso = Math.max(0, parseFloat((peso + delta).toFixed(2)));
    this.pesoTemporal = peso.toFixed(2);
  }

  startHold(increase: boolean) {
    this.holdStart = Date.now();
    const direction = increase ? 1 : -1;
    this.holdInterval = setInterval(() => {
      const elapsed = Date.now() - this.holdStart;
      let step = 0.05;
      if (elapsed > 4000) {
        step = 1;
      } else if (elapsed > 2000) {
        step = 0.1;
      } else {
        step = 0.05;
      }
      this.ajustarPeso(step * direction);
    }, 200);
  }

  stopHold() {
    if (this.holdInterval) {
      clearInterval(this.holdInterval);
      this.holdInterval = null;
    }
  }

  confirmarPeso() {
    if (!this.productoSeleccionado) {
      return;
    }
    const cantidad = parseFloat(this.pesoTemporal);
    if (isNaN(cantidad) || cantidad <= 0) {
      this.mostrarError('Peso inválido');
      return;
    }

    const subtotal = this.productoSeleccionado.price * cantidad;
    this.itemsPedido.push({
      producto: this.productoSeleccionado,
      cantidad,
      subtotal
    });
    this.calcularTotal();
    this.cerrarPesoModal();
  }

  cerrarPesoModal() {
    this.showPesoModal = false;
    this.productoSeleccionado = null;
    this.pesoTemporal = '0.00';
    this.stopHold();
  }

  eliminarItem(index: number) {
    this.itemsPedido.splice(index, 1);
    this.calcularTotal();
  }

  modificarCantidad(item: {producto: Producto, cantidad: number, subtotal: number}, aumentar: boolean) {
    const step = item.producto.is_weighable ? 0.05 : 1;
    let nuevaCantidad = item.cantidad + (aumentar ? step : -step);
    nuevaCantidad = item.producto.is_weighable ? parseFloat(nuevaCantidad.toFixed(2)) : Math.round(nuevaCantidad);
    this.establecerCantidad(item, nuevaCantidad);
  }

  cambiarCantidadManual(item: {producto: Producto, cantidad: number, subtotal: number}, valor: string) {
    let cantidad = parseFloat(valor);
    if (isNaN(cantidad)) {
      return;
    }
    cantidad = item.producto.is_weighable ? parseFloat(cantidad.toFixed(2)) : Math.round(cantidad);
    this.establecerCantidad(item, cantidad);
  }

  private establecerCantidad(item: {producto: Producto, cantidad: number, subtotal: number}, cantidad: number) {
    if (cantidad <= 0) {
      const index = this.itemsPedido.indexOf(item);
      if (index !== -1) {
        this.eliminarItem(index);
      }
      return;
    }

    item.cantidad = cantidad;
    item.subtotal = item.producto.price * cantidad;
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

    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Pedido creado exitosamente',
      buttons: ['OK']
    });

    await alert.present();
    
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

  esPesoValido(): boolean {
    return !!(this.pesoTemporal && parseFloat(this.pesoTemporal) > 0);
  }
}