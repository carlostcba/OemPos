import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductoService, Producto } from '../services/producto.service';
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

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private productoService: ProductoService,
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
    });

    if (this.producto?.product_image_id) {
      this.imagenURL = this.producto.product_image_id;
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
      await this.productoService.actualizarProducto(actualizado).toPromise();

      if (this.imagenSeleccionadaId) {
        await this.http.put(`${environment.apiUrl}/images/link`, {
          owner_type: 'products',
          owner_id: this.producto.id,
          image_id: this.imagenSeleccionadaId
        }).toPromise();
      }

      // Notificar al componente padre que hubo una actualización con el producto actualizado
      this.modalCtrl.dismiss({ actualizado });
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el producto.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
