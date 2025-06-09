import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImagenProducto {
  id: string;
  filename: string;
  url: string;
  title: string;
  mime_type: string;
  size: number;
  created_at: string;
  storage: string;
}

export interface RespuestaImagenes {
  owner_type: string;
  owner_id: string;
  count: number;
  images: ImagenProducto[];
}

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  // Subir múltiples imágenes
  subirImagenes(files: File[], owner_type: string, owner_id: string, tag: string = 'default'): Observable<any> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('images', file);
    });

    formData.append('owner_type', owner_type);
    formData.append('owner_id', owner_id);
    formData.append('tag', tag);

    return this.http.post(`${this.apiUrl}`, formData);
  }

  // Obtener imágenes por entidad
  obtenerImagenes(owner_type: string, owner_id: string, tag?: string): Observable<RespuestaImagenes> {
    let params = `owner_type=${owner_type}&owner_id=${owner_id}`;
    if (tag) {
      params += `&tag=${tag}`;
    }
    return this.http.get<RespuestaImagenes>(`${this.apiUrl}?${params}`);
  }

  // Eliminar imagen
  eliminarImagen(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Actualizar vínculo de imagen
  actualizarVinculo(owner_type: string, owner_id: string, image_id: string, tag: string = 'default'): Observable<any> {
    return this.http.put(`${this.apiUrl}/link`, {
      owner_type,
      owner_id,
      image_id,
      tag
    });
  }

  // Obtener URL de imagen
  obtenerUrlImagen(id: string): string {
    return `${this.apiUrl}/${id}`;
  }

  // Convertir archivo a base64
  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Convertir imagen base64 a cuadrado (relleno blanco si es necesario)
  async convertirImagenACuadrado(base64: string, filename: string, mimeType: string): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        const offsetX = (size - img.width) / 2;
        const offsetY = (size - img.height) / 2;
        ctx.drawImage(img, offsetX, offsetY);

        canvas.toBlob((blob) => {
          if (blob) {
            const squareFile = new File([blob], filename, { type: mimeType });
            resolve(squareFile);
          }
        }, mimeType);
      };
      img.src = base64;
    });
  }

  // Transformar imagen al subir (cuadrada + preview)
  async transformarImagenAlSubir(file: File): Promise<{ file: File; preview: string }> {
    const base64 = await this.convertirArchivoABase64(file);
    const squareFile = await this.convertirImagenACuadrado(base64, file.name, file.type);
    return {
      file: squareFile,
      preview: URL.createObjectURL(squareFile)
    };
  }
}
