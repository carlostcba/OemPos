// src/app/productos/formulario/producto-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { ProductoService } from '../services/producto.service';
import { CategoriaService, Categoria, Subcategoria } from '../../shared/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: ` `
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  loading = false;
  currentUser: any = null;
  debugInfo: any = null;

  // ✅ Datos para categorías y subcategorías
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasDisponibles: Subcategoria[] = [];
  cargandoCategorias = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
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
      is_active: [true],
      // ✅ Agregar campos de categoría
      category_id: [''],
      subcategory_id: ['']
    });
  }

  ngOnInit() {
    
  }
}