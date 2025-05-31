import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductoService, Producto } from '../services/producto.service';
import { CategoriaService, Categoria, Subcategoria } from '../../shared/services/categoria.service';
import { GaleriaImagenesModal } from '../../shared/services/galeria-imagenes.modal';

@Component({
  selector: 'app-producto-editar',
  standalone: true,
  templateUrl: './producto-editar.modal.html',
  styleUrls: ['./producto-editar.modal.scss'],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
})
export class ProductoEditarModal implements OnInit {
  @Input() producto!: Producto;

  form!: FormGroup;
  imagenURL: string = 'assets/no_image_available.png';
  imagenSeleccionadaId: string | null = null;
  editMode: boolean = true;
  
  // ✅ Datos para categorías y subcategorías
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasDisponibles: Subcategoria[] = [];
  cargandoCategorias = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.producto?.name || '', Validators.required],
      plu_code: [this.producto?.plu_code || '', [Validators.pattern(/^[0-9]+$/)]],
      price: [this.producto?.price || 0, [Validators.required, Validators.min(0.01)]],
      stock: [this.producto?.stock || 0],
      description: [this.producto?.description || ''],
      is_weighable: [this.producto?.is_weighable || false],
      unit_label: [this.producto?.unit_label || 'unidad'],
      track_stock: [this.producto?.track_stock ?? true],
      is_active: [this.producto?.is_active ?? true],
      // ✅ Agregar campos de categoría
      category_id: [this.producto?.category_id || ''],
      subcategory_id: [this.producto?.subcategory_id || '']
    });

    // ✅ Configurar listener para cambios de categoría
    this.form.get('category_id')?.valueChanges.subscribe(categoryId => {
      this.onCategoriaChange(categoryId);
    });

    // Cargar imagen existente
    this.cargarImagenProducto();
    
    // ✅ Cargar categorías y subcategorías
    this.cargarCategorias();
  }

  // ✅ Cargar categorías desde el backend
  async cargarCategorias() {
    this.cargandoCategorias = true;
    try {
      // Cargar categorías y subcategorías en paralelo
      const [categorias, subcategorias] = await Promise.all([
        this.categoriaService.getCategorias().toPromise(),
        this.categoriaService.getSubcategorias().toPromise()
      ]);

      this.categorias = categorias || [];
      this.subcategorias = subcategorias || [];

      // Si ya hay una categoría seleccionada, filtrar subcategorías
      const categoriaSeleccionada = this.form.get('category_id')?.value;
      if (categoriaSeleccionada) {
        this.filtrarSubcategorias(categoriaSeleccionada);
      }

      console.log('✅ Categorías cargadas:', this.categorias.length);
      console.log('✅ Subcategorías cargadas:', this.subcategorias.length);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar las categorías. Verifique su conexión.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.cargandoCategorias = false;
    }
  }

  // ✅ Manejar cambio de categoría
  onCategoriaChange(categoryId: string) {
    console.log('📂 Categoría seleccionada:', categoryId);
    
    // Limpiar subcategoría seleccionada
    this.form.patchValue({ subcategory_id: '' });
    
    // Filtrar subcategorías disponibles
    this.filtrarSubcategorias(categoryId);
  }

  // ✅ Filtrar subcategorías por categoría
  filtrarSubcategorias(categoryId: string) {
    if (categoryId) {
      this.subcategoriasDisponibles = this.subcategorias.filter(
        sub => sub.category_id === categoryId
      );
      console.log('📋 Subcategorías disponibles:', this.subcategoriasDisponibles.length);
    } else {
      this.subcategoriasDisponibles = [];
    }
  }

  // ✅ Obtener nombre de categoría
  getNombreCategoria(categoryId: string): string {
    const categoria = this.categorias.find(cat => cat.id === categoryId);
    return categoria?.name || 'Sin categoría';
  }

  // ✅ Obtener nombre de subcategoría
  getNombreSubcategoria(subcategoryId: string): string {
    const subcategoria = this.subcategorias.find(sub => sub.id === subcategoryId);
    return subcategoria?.name || 'Sin subcategoría';
  }

  // Agregar método para cargar imagen
  async cargarImagenProducto() {
    if (this.producto?.id) {
      try {
        const response = await this.http.get(`${environment.apiUrl}/images?owner_type=products&owner_id=${this.producto.id}`).toPromise() as any;
        if (response?.images && response.images.length > 0) {
          this.imagenURL = response.images[0].url;
          this.imagenSeleccionadaId = response.images[0].id;
        }
      } catch (error) {
        console.error('Error al cargar imagen del producto:', error);
      }
    }
  }

  async abrirGaleriaImagenes() {
    const modal = await this.modalCtrl.create({
      component: GaleriaImagenesModal,
      cssClass: 'modal-elevado',
      componentProps: {
        owner_type: 'products',
        owner_id: this.producto.id
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.url && data?.id) {
      this.imagenURL = data.url;
      this.imagenSeleccionadaId = data.id;
    }
  }

  async guardar() {
  if (this.form.invalid) {
    const alert = await this.alertCtrl.create({
      header: 'Formulario incompleto',
      message: 'Por favor completá todos los campos obligatorios correctamente.',
      buttons: ['Aceptar']
    });
    await alert.present();
    return;
  }

  const actualizado: Producto = {
    ...this.producto,
    ...this.form.value,
    product_image_id: this.imagenSeleccionadaId || this.producto.product_image_id
  };

  try {
    console.log('📝 Enviando datos de actualización:', actualizado);
    
    const resultado = await this.productoService.actualizarProducto(actualizado).toPromise();
    
    console.log('✅ Producto actualizado exitosamente:', resultado);

    if (this.imagenSeleccionadaId) {
      await this.http.put(`${environment.apiUrl}/images/link`, {
        owner_type: 'products',
        owner_id: this.producto.id,
        image_id: this.imagenSeleccionadaId
      }).toPromise();
    }

    // Notificar al componente padre que hubo una actualización con el producto actualizado
    this.modalCtrl.dismiss({ actualizado: resultado });
  } catch (error: any) {
    console.error('❌ Error completo al actualizar producto:', error);
    
    let mensaje = 'No se pudo actualizar el producto';
    
    if (error.status === 400) {
      mensaje = error.error?.error || 'Datos inválidos';
    } else if (error.status === 404) {
      mensaje = 'Producto no encontrado';
    } else if (error.status === 409) {
      mensaje = error.error?.error || 'Conflicto de datos';
    } else if (error.error?.error) {
      mensaje = error.error.error;
    } else if (error.error?.message) {
      mensaje = error.error.message;
    } else if (error.message) {
      mensaje = error.message;
    }
    
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

  toggleEdit() {
    this.editMode = !this.editMode;

    if (this.editMode) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}