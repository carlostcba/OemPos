// frontend/src/app/shared/services/imagen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImageUploadResponse {
  message: string;
  images: any[];
}

export interface ImageResult {
  id: number;
  path?: string;
  url?: string;
  mime_type: string;
  storage_type: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private apiUrl = `${environment.apiUrl}/images`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Sube imágenes a la API sin asociarlas a ninguna entidad
   * @param files Archivos de imagen a subir
   */
  uploadImagesOnly(files: File[]): Observable<ImageUploadResponse> {
    const formData = new FormData();
   
    // Agregar cada archivo al FormData
    files.forEach(file => {
      formData.append('images', file);
    });
   
    return this.http.post<ImageUploadResponse>(this.apiUrl, formData);
  }
  
  /**
   * Obtiene todas las imágenes disponibles
   */
  getAllImages(): Observable<ImageResult[]> {
    return this.http.get<ImageResult[]>(this.apiUrl);
  }
  
  /**
   * Elimina una imagen
   * @param imageId ID de la imagen a eliminar
   */
  deleteImage(imageId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${imageId}`);
  }
}