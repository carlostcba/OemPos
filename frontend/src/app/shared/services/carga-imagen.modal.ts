import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { ImagenService } from './imagen.service';

@Component({
  selector: 'app-carga-imagenes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './carga-imagenes.modal.html',
  styleUrls: ['./carga-imagenes.modal.scss']
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

  async onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];

    for (const file of files) {
      const transformado = await this.imagenService.transformarImagenAlSubir(file);
      this.selectedFiles.push({
        file: transformado.file,
        preview: transformado.preview,
        asociadoCon: null
      });
    }
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
