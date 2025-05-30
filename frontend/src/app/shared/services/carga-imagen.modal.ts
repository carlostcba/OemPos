import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← Agregar
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { ImagenService } from './imagen.service';

@Component({
  selector: 'app-carga-imagenes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule], // ← Agregar FormsModule
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Cargar Imágenes</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarModal()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Instrucciones -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Instrucciones</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ol>
            <li>Selecciona múltiples imágenes</li>
            <li>Asocia cada imagen con un {{ campoAsociacion }}</li>
            <li>Confirma la carga</li>
          </ol>
        </ion-card-content>
      </ion-card>

      <!-- Selector de archivos -->
      <ion-button expand="block" fill="outline" (click)="triggerFileInput()">
        <ion-icon name="cloud-upload" slot="start"></ion-icon>
        Seleccionar Imágenes
      </ion-button>
      
      <input 
        #fileInput 
        type="file" 
        multiple 
        accept="image/*" 
        (change)="onFilesSelected($event)" 
        style="display: none;">

      <!-- Preview de archivos seleccionados -->
      <div *ngIf="selectedFiles.length > 0" class="files-preview">
        <ion-list>
          <ion-list-header>
            <ion-label>Archivos seleccionados ({{ selectedFiles.length }})</ion-label>
          </ion-list-header>
          
          <ion-item *ngFor="let file of selectedFiles; let i = index">
            <ion-thumbnail slot="start">
              <img [src]="file.preview" [alt]="file.file.name">
            </ion-thumbnail>
            
            <ion-label>
              <h3>{{ file.file.name }}</h3>
              <p>{{ (file.file.size / 1024).toFixed(2) }} KB</p>
            </ion-label>
            
            <ion-select 
              [(ngModel)]="file.asociadoCon" 
              placeholder="Seleccionar {{ campoAsociacion }}"
              slot="end"
              style="max-width: 200px;">
              <ion-select-option 
                *ngFor="let elemento of elementos" 
                [value]="elemento.id">
                {{ elemento[campoAsociacion] }}
              </ion-select-option>
            </ion-select>
            
            <ion-button 
              fill="clear" 
              color="danger" 
              (click)="removerArchivo(i)"
              slot="end">
              <ion-icon name="trash" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <!-- Botones de acción -->
      <div *ngIf="selectedFiles.length > 0" class="action-buttons">
        <ion-button 
          expand="block" 
          color="success" 
          (click)="procesarCarga()" 
          [disabled]="uploading || !todasLasImagenesTienenAsociacion()">
          <ion-icon name="cloud-upload" slot="start"></ion-icon>
          {{ uploading ? 'Procesando...' : 'Cargar Imágenes' }}
        </ion-button>
        
        <ion-progress-bar 
          *ngIf="uploading" 
          [value]="progreso">
        </ion-progress-bar>
      </div>

      <!-- Resultados -->
      <div *ngIf="resultados.length > 0" class="resultados">
        <ion-list>
          <ion-list-header>
            <ion-label>Resultados de Carga</ion-label>
          </ion-list-header>
          
          <ion-item *ngFor="let resultado of resultados">
            <ion-icon 
              [name]="resultado.exito ? 'checkmark-circle' : 'close-circle'" 
              [color]="resultado.exito ? 'success' : 'danger'" 
              slot="start">
            </ion-icon>
            
            <ion-label>
              <h3>{{ resultado.archivo }}</h3>
              <!-- Cambiar [color] por color directo -->
              <p [style.color]="resultado.exito ? 'var(--ion-color-success)' : 'var(--ion-color-danger)'">
                {{ resultado.mensaje }}
              </p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    .files-preview {
      margin-top: 16px;
    }

    .action-buttons {
      margin-top: 16px;
    }

    .resultados {
      margin-top: 16px;
    }

    ion-thumbnail img {
      object-fit: cover;
    }
  `]
})
export class CargaImagenesModal implements OnInit {
  @Input() elementos: any[] = [];
  @Input() campoAsociacion: string = 'name';

  selectedFiles: {
    file: File;
    preview: string;
    asociadoCon: string | null;
  }[] = [];

  uploading: boolean = false;
  progreso: number = 0;
  resultados: {
    archivo: string;
    exito: boolean;
    mensaje: string;
  }[] = [];

  constructor(
    private modalCtrl: ModalController,
    private imagenService: ImagenService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFiles.push({
          file,
          preview: e.target?.result as string,
          asociadoCon: null
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removerArchivo(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  todasLasImagenesTienenAsociacion(): boolean {
    return this.selectedFiles.every(f => f.asociadoCon !== null);
  }

  async procesarCarga() {
    this.uploading = true;
    this.progreso = 0;
    this.resultados = [];

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const fileData = this.selectedFiles[i];
      
      try {
        await this.imagenService.subirImagenes(
          [fileData.file],
          'products',
          fileData.asociadoCon!
        ).toPromise();

        this.resultados.push({
          archivo: fileData.file.name,
          exito: true,
          mensaje: 'Cargado exitosamente'
        });
      } catch (error) {
        this.resultados.push({
          archivo: fileData.file.name,
          exito: false,
          mensaje: 'Error al cargar'
        });
      }

      this.progreso = (i + 1) / this.selectedFiles.length;
    }

    this.uploading = false;
    this.mostrarResumen();
  }

  async mostrarResumen() {
    const exitosos = this.resultados.filter(r => r.exito).length;
    const fallidos = this.resultados.filter(r => !r.exito).length;

    const alert = await this.alertCtrl.create({
      header: 'Carga Completada',
      message: `Exitosos: ${exitosos}, Fallidos: ${fallidos}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  cerrarModal() {
    this.modalCtrl.dismiss({ recargado: this.resultados.some(r => r.exito) });
  }
}