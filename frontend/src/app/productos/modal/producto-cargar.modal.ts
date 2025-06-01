//app/productos/modal/producto-carga.moda.ts

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController, LoadingController, IonicModule } from '@ionic/angular';
import { ProductoService, Producto} from '../../productos/services/producto.service';
import { CategoriaService, Categoria, Subcategoria } from '../../shared/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { GaleriaImagenesModal } from '../../shared/services/galeria-imagenes.modal';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-producto-cargar-modal',
  standalone: true,
  templateUrl: './producto-cargar.modal.html',
  styleUrls: ['./producto-cargar.modal.scss'],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
})
export class ProductoCargarModal implements OnInit {
   @Input() producto!: Producto;
  
  productoForm: FormGroup;
  loading = false;
  currentUser: any = null;
  debugInfo: any = null;

  // ✅ Datos para categorías y subcategorías
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasDisponibles: Subcategoria[] = [];
  cargandoCategorias = false;

  // ✅ Imagen por defecto
  imagenURL: string = 'assets/no_image_available.png';

  imagenSeleccionadaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private http: HttpClient
    
  ) {
    // ✅ Inicializar formulario reactivo
    this.productoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      plu_code: ['', [Validators.pattern(/^[0-9]+$/)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      is_weighable: [false],
      unit_label: ['unidad'],
      stock: [0, [Validators.min(0)]],
      track_stock: [true],
      is_active: [true],
      category_id: [''],
      subcategory_id: ['']
    });
  }

  ngOnInit() {
    // ✅ Obtener usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Usuario actual en formulario:', user);

      if (!user) {
        console.log('❌ No hay usuario autenticado');
        this.modalCtrl.dismiss(); // Cierra el modal sin navegar
      }
    });

    // ✅ Configurar listener para cambios de categoría
    this.productoForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      this.onCategoriaChange(categoryId);
    });

    // ✅ Configurar validaciones dinámicas para stock
    this.productoForm.get('track_stock')?.valueChanges.subscribe(trackStock => {
      const stockControl = this.productoForm.get('stock');
      if (trackStock) {
        stockControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        stockControl?.clearValidators();
        stockControl?.setValue(0);
      }
      stockControl?.updateValueAndValidity();
    });

    // ✅ Cargar categorías y subcategorías
    this.cargarCategorias();
  }

  // ✅ Cargar categorías desde el backend
  async cargarCategorias() {
    this.cargandoCategorias = true;
    try {
      const [categorias, subcategorias] = await Promise.all([
        this.categoriaService.getCategorias().toPromise(),
        this.categoriaService.getSubcategorias().toPromise()
      ]);

      this.categorias = categorias || [];
      this.subcategorias = subcategorias || [];
    } catch (error) {
      await this.mostrarAlerta('Error', 'No se pudieron cargar las categorías.');
    } finally {
      this.cargandoCategorias = false;
    }
  }

  // ✅ Manejar cambio de categoría
  onCategoriaChange(categoryId: string) {
    console.log('📂 Categoría seleccionada:', categoryId);

    // Limpiar subcategoría seleccionada
    this.productoForm.patchValue({ subcategory_id: '' });

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
  

  // ✅ Crear producto en backend
  // ✅ Crear producto en backend
async crearProducto() {
  console.log('🚀 Iniciando creación de producto...');

  if (this.productoForm.invalid) {
    this.markFormGroupTouched(this.productoForm);
    await this.mostrarAlerta('Error', 'Por favor complete todos los campos requeridos correctamente.');
    return;
  }

  if (!this.currentUser?.id) {
    await this.mostrarAlerta('Error', 'Usuario no autenticado. Cierre el modal e intente nuevamente.');
    this.modalCtrl.dismiss();
    return;
  }

  this.loading = true;
  const loading = await this.loadingController.create({
    message: 'Creando producto...'
  });

  await loading.present();

  try {
    // Preparar datos del producto
    const formData = this.productoForm.value;
    const productoData = {
      name: formData.name.trim(),
      plu_code: formData.plu_code || null,
      price: parseFloat(formData.price),
      description: formData.description?.trim() || null,
      is_weighable: formData.is_weighable || false,
      unit_label: formData.unit_label || 'unidad',
      stock: formData.track_stock ? parseFloat(formData.stock || 0) : 0,
      track_stock: formData.track_stock !== false,
      is_active: formData.is_active !== false,
      created_by: this.currentUser.id,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null
    };

    console.log('📝 Datos a enviar al servidor:', productoData);

    this.debugInfo = {
      usuario: this.currentUser,
      datos: productoData,
      timestamp: new Date().toISOString()
    };

    // 🛠️ Crear producto
    const resultado = await this.productoService.create(productoData).toPromise();

    console.log('✅ Producto creado exitosamente:', resultado);

    // 🔗 Si se seleccionó una imagen previamente, vincularla ahora al producto creado
    if (this.imagenSeleccionadaId && resultado && resultado.id) {
      await this.http.put(`${environment.apiUrl}/images/link`, {
        owner_type: 'products',
        owner_id: resultado.id,
        image_id: this.imagenSeleccionadaId
      }).toPromise();
    }

    await loading.dismiss();
    await this.mostrarAlerta('Éxito', 'Producto creado exitosamente');

    // ✅ Cerrar el modal con éxito
    this.modalCtrl.dismiss({ creado: resultado });

  } catch (error: any) {
    console.error('❌ Error al crear producto:', error);
    await loading.dismiss();

    let mensaje = 'No se pudo crear el producto';

    if (error.status === 400) {
      mensaje = error.error?.error || 'Datos inválidos';
    } else if (error.status === 401) {
      mensaje = 'Sesión expirada';
      this.modalCtrl.dismiss();
      return;
    } else if (error.status === 403) {
      mensaje = 'Permiso denegado';
    } else if (error.error?.error) {
      mensaje = error.error.error;
    } else if (error.message) {
      mensaje = error.message;
    }

    if (error.error?.details) {
      mensaje += `\nDetalles: ${error.error.details}`;
    }

    this.debugInfo = {
      usuario: this.currentUser,
      error: {
        status: error.status,
        message: error.message,
        errorObj: error.error,
        fullError: error
      },
      timestamp: new Date().toISOString()
    };

    await this.mostrarAlerta('Error', mensaje);
  } finally {
    this.loading = false;
  }
}

  // ✅ Cerrar el modal sin acción
  cancelar() {
    this.modalCtrl.dismiss();
  }

  // ✅ Marcar campos como tocados para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // ✅ Mostrar alerta
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async abrirGaleriaImagenes() {
    const modal = await this.modalCtrl.create({
      component: GaleriaImagenesModal,
      cssClass: 'modal-elevado',
      componentProps: {
        owner_type: 'products',
        owner_id: null  // 👈 No mandamos aún el ID porque no existe
      }
    });
  
    await modal.present();
    const { data } = await modal.onDidDismiss();
  
    if (data?.url && data?.id) {
      this.imagenURL = data.url;
      this.imagenSeleccionadaId = data.id;
    }
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
  
}
