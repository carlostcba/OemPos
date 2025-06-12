import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InventoryService, Producto } from '../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class InventoryComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario() {
    this.loading = true;
    this.inventoryService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.loading = false;
      }
    });
  }

  verDetalle(producto: Producto) {
    // TODO: Abrir modal o página con detalle del producto
    console.log('Ver detalle:', producto);
  }

  agregarProducto() {
    // TODO: Abrir modal para crear producto
    console.log('Agregar nuevo producto');
  }

  editarProducto(producto: Producto) {
    // TODO: Abrir modal para editar producto
    console.log('Editar producto:', producto);
  }

  eliminarProducto(producto: Producto) {
    // TODO: Confirmar eliminación y llamar a backend
    console.log('Eliminar producto:', producto);
  }
}
