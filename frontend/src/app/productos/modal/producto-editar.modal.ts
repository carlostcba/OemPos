import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../services/producto.service';

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
  editMode: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.producto?.name || '', Validators.required],
      plu_code: [this.producto?.plu_code || ''],
      price: [this.producto?.price || 0, [Validators.required, Validators.min(0)]],
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

  async guardar() {
    if (this.form.invalid) return;

    const actualizado: Producto = {
      ...this.producto,
      ...this.form.value,
    };

    try {
      await this.productoService.actualizarProducto(actualizado).toPromise();
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
