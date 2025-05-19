import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface ImagenCargada {
  nombre: string;
  base64: string;
  seleccionado: boolean;
  file?: File;
}

@Component({
  selector: 'app-carga-imagenes',
  templateUrl: './carga-imagenes.modal.html',
  styleUrls: ['./carga-imagenes.modal.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CargaImagenesModal implements OnInit {
  imagenes: ImagenCargada[] = [];
  apiUrl = environment.apiUrl;
  
  @Input() endpointBase: string = '';
  @Input() campoAsociacion: string = '';
  @Input() elementos: any[] = [];
  
  titulo: string = 'Galería de Imágenes';
  isLoading: boolean = false;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('CargaImagenesModal inicializado:', {
      endpointBase: this.endpointBase,
      campoAsociacion: this.campoAsociacion,
      elementos: this.elementos
    });
    
    if (this.endpointBase) {
      this.titulo = `Imágenes para ${this.endpointBase}`;
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async cargarImagenes(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await this.convertirYRedimensionar(file, 400, 400);
      this.imagenes.push({ 
        nombre: file.name, 
        base64, 
        seleccionado: true, // Automáticamente seleccionamos las imágenes
        file: file
      });
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

  // Método auxiliar para crear un blob a partir de una imagen base64
  dataURItoBlob(dataURI: string): Blob {
    // Convertir la cadena base64 en un Blob
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }

  async guardarTodas() {
    const seleccionadas = this.imagenes.filter(img => img.seleccionado);
    if (seleccionadas.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona al menos una imagen para guardar',
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    console.log('Iniciando guardado de', seleccionadas.length, 'imágenes');

    try {
      // Crear un nuevo FormData
      const formData = new FormData();
      
      // Agregar campos obligatorios
      let owner_type = this.endpointBase || 'products';
      let owner_id = '1';
      
      if (this.elementos && this.elementos.length > 0 && this.elementos[0].id) {
        owner_id = this.elementos[0].id;
      }
      
      formData.append('owner_type', owner_type);
      formData.append('owner_id', owner_id);
      
      console.log('Metadata:', {
        owner_type,
        owner_id
      });
      
      // Agregar cada imagen seleccionada
      for (let i = 0; i < seleccionadas.length; i++) {
        const img = seleccionadas[i];
        if (img.file) {
          // Si tenemos el archivo original, usarlo
          formData.append('images', img.file, img.nombre);
          console.log(`Agregando imagen original ${i}:`, img.nombre);
        } else {
          // Si no tenemos el archivo original, convertir de base64 a blob
          const blob = this.dataURItoBlob(img.base64);
          formData.append('images', blob, img.nombre || `image${i}.png`);
          console.log(`Agregando imagen convertida ${i}:`, img.nombre || `image${i}.png`);
        }
      }
      
      // Verificar que formData tiene contenido
      let hasContent = false;
      for (const pair of (formData as any).entries()) {
        console.log(`FormData: ${pair[0]} = ${pair[1] instanceof Blob ? 'Blob/File' : pair[1]}`);
        hasContent = true;
      }
      
      if (!hasContent) {
        throw new Error('El FormData está vacío, no se pudo preparar la solicitud correctamente');
      }
      
      // Hacer la solicitud directamente sin pasar por el interceptor
      console.log(`Enviando solicitud a ${this.apiUrl}/images`);
      
      const url = `${this.apiUrl}/images`;
      const token = await this.authService.getToken();
      
      // Crear una solicitud fetch manual para mayor control
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type, el navegador lo establece automáticamente con el boundary
        },
        body: formData
      });
      
      console.log('Respuesta status:', response.status);
      
      // Verificar la respuesta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Respuesta exitosa:', data);
      
      // Mostrar mensaje de éxito
      const toast = await this.toastCtrl.create({
        message: 'Imágenes guardadas correctamente',
        duration: 3000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      
      // Limpiar imágenes seleccionadas
      this.imagenes = this.imagenes.filter(img => !img.seleccionado);
      
      // Cerrar modal con resultado
      this.modalCtrl.dismiss({ recargado: true });
      
    } catch (error: any) {
      console.error('Error al guardar imágenes:', error);
      
      // Mostrar mensaje de error
      const toast = await this.toastCtrl.create({
        message: `Error al guardar imágenes: ${error.message || 'Error desconocido'}`,
        duration: 5000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
}