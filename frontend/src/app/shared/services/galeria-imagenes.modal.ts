import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← Agregar
import { IonicModule, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ImagenService, ImagenProducto } from './imagen.service';

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule], // ← Agregar FormsModule
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ selectedProductForImage ? 'Seleccionar imagen para: ' + selectedProductForImage : 'Galería de Imágenes' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarModal()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Subir nueva imagen -->
      <div class="upload-section">
        <ion-item>
          <ion-label position="stacked">Título de la imagen</ion-label>
          <ion-input [(ngModel)]="imageTitle" placeholder="Título de la imagen"></ion-input>
        </ion-item>
        
        <div class="upload-controls">
          <ion-button fill="outline" (click)="triggerFileInput()">
            <ion-icon name="cloud-upload" slot="start"></ion-icon>
            {{ selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo' }}
          </ion-button>
          
          <ion-button 
            color="success" 
            (click)="subirImagen()" 
            [disabled]="!selectedFile || !imageTitle || uploading">
            <ion-icon name="save" slot="start"></ion-icon>
            {{ uploading ? 'Subiendo...' : 'Subir Imagen' }}
          </ion-button>
        </div>
        
        <input 
          #fileInput 
          type="file" 
          accept="image/*" 
          (change)="onFileSelected($event)" 
          style="display: none;">
          
        <ion-note *ngIf="selectedFile" color="medium">
          Archivo seleccionado: {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
        </ion-note>
      </div>

      <!-- Buscador -->
      <ion-searchbar 
        [(ngModel)]="searchQuery" 
        (ionInput)="filtrarImagenes()" 
        placeholder="Buscar imágenes...">
      </ion-searchbar>

      <!-- Loading -->
      <div *ngIf="loadingGallery" class="loading-container">
        <ion-spinner></ion-spinner>
        <ion-label>Cargando imágenes...</ion-label>
      </div>

      <!-- Grid de imágenes -->
      <div *ngIf="!loadingGallery" class="images-grid">
        <div 
          *ngFor="let image of filteredImages" 
          class="image-card"
          (click)="seleccionarImagen(image)">
          <img [src]="image.url" [alt]="image.title" />
          <div class="image-overlay">
            <ion-label>{{ image.title }}</ion-label>
          </div>
          <div *ngIf="updatingImage" class="loading-overlay">
            <ion-spinner></ion-spinner>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay imágenes -->
      <div *ngIf="!loadingGallery && filteredImages.length === 0" class="empty-state">
        <ion-icon name="images" size="large" color="medium"></ion-icon>
        <ion-label color="medium">No se encontraron imágenes. ¡Sube la primera!</ion-label>
      </div>
    </ion-content>
  `,
  styles: [`
    .upload-section {
      background: var(--ion-color-light);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .upload-controls {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .image-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .image-card:hover {
      transform: scale(1.05);
    }

    .image-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 8px;
      color: white;
      font-size: 12px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 16px;
    }
  `]
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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