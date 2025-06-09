import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ImagenService, ImagenProducto } from './imagen.service';

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './galeria-imagenes.modal.html',
  styleUrls: ['./galeria-imagenes.modal.scss']
})
export class GaleriaImagenesModal implements OnInit {
  @Input() owner_type: string = '';
  @Input() owner_id: string = '';
  @Input() selectedProductForImage: string = '';

  imagenes: ImagenProducto[] = [];
  filteredImages: ImagenProducto[] = [];
  searchQuery: string = '';
  loadingGallery: boolean = false;
  updatingImage: boolean = false;
  uploading: boolean = false;
  imageTitle: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private imagenService: ImagenService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarImagenes();
  }

  async cargarImagenes() {
    this.loadingGallery = true;
    try {
      const response = await this.imagenService.obtenerImagenes(this.owner_type, this.owner_id).toPromise();
      this.imagenes = response?.images || [];
      this.filteredImages = [...this.imagenes];
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      this.mostrarAlerta('Error', 'No se pudieron cargar las imágenes');
    } finally {
      this.loadingGallery = false;
    }
  }

  filtrarImagenes() {
    if (!this.searchQuery.trim()) {
      this.filteredImages = [...this.imagenes];
    } else {
      this.filteredImages = this.imagenes.filter(img =>
        img.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const transformado = await this.imagenService.transformarImagenAlSubir(file);
      this.selectedFile = transformado.file;
      this.previewUrl = transformado.preview;
    }
  }

  async subirImagen() {
    if (!this.selectedFile || !this.imageTitle.trim()) {
      this.mostrarAlerta('Error', 'Selecciona un archivo y proporciona un título');
      return;
    }

    this.uploading = true;
    try {
      await this.imagenService.subirImagenes(
        [this.selectedFile],
        this.owner_type,
        this.owner_id
      ).toPromise();

      this.mostrarAlerta('Éxito', 'Imagen subida correctamente');
      this.imageTitle = '';
      this.selectedFile = null;
      this.previewUrl = null;
      await this.cargarImagenes();
    } catch (error) {
      console.error('Error al subir imagen:', error);
      this.mostrarAlerta('Error', 'No se pudo subir la imagen');
    } finally {
      this.uploading = false;
    }
  }

  async seleccionarImagen(imagen: ImagenProducto) {
    if (this.selectedProductForImage) {
      this.updatingImage = true;
      try {
        await this.imagenService.actualizarVinculo(
          this.owner_type,
          this.owner_id,
          imagen.id
        ).toPromise();

        this.modalCtrl.dismiss({
          url: imagen.url,
          id: imagen.id,
          selected: true
        });
      } catch (error) {
        console.error('Error al asociar imagen:', error);
        this.mostrarAlerta('Error', 'No se pudo asociar la imagen');
      } finally {
        this.updatingImage = false;
      }
    } else {
      this.modalCtrl.dismiss({
        url: imagen.url,
        id: imagen.id,
        selected: true
      });
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
