import { Component, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface ImagenCargada {
  nombre: string;
  base64: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-carga-imagenes',
  templateUrl: './carga-imagenes.modal.html',
  styleUrls: ['./carga-imagenes.modal.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CargaImagenesModal {
  imagenes: ImagenCargada[] = [];

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private modalCtrl: ModalController) {}

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async cargarImagenes(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await this.convertirYRedimensionar(file, 400, 400);
      this.imagenes.push({ nombre: file.name, base64, seleccionado: false });
    }

    event.target.value = '';
  }

  async convertirYRedimensionar(file: File, ancho: number, alto: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = ancho;
          canvas.height = alto;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, ancho, alto);
            ctx.drawImage(img, 0, 0, ancho, alto);
            resolve(canvas.toDataURL('image/png'));
          }
        };
      };
      reader.readAsDataURL(file);
    });
  }

  alternarSeleccion(img: ImagenCargada) {
    img.seleccionado = !img.seleccionado;
  }

  eliminarImagen(img: ImagenCargada) {
    this.imagenes = this.imagenes.filter(i => i !== img);
  }

  guardarTodas() {
    const seleccionadas = this.imagenes.filter(img => img.seleccionado);
    console.log('Guardar:', seleccionadas);
    // this.modalCtrl.dismiss({ imagenes: seleccionadas });
  }
}
