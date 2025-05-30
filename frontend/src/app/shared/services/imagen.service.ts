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
}