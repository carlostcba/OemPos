// src/app/productos/services/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
  id: string;
  name: string;
  plu_code: string;
  price: number;
  is_weighable: boolean;
  unit_label: string;
  stock: number;
  track_stock: boolean;
  is_active: boolean;
  description: string;
  category_id?: string;
  subcategory_id?: string;
  product_image_id?: string;
  image_url?: string; // ← Agregar este campo
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  create(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  update(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  actualizarProducto(producto: Producto): Observable<Producto> {
    return this.update(producto.id, producto);
  }

  obtenerImagenProducto(productId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/images?owner_type=products&owner_id=${productId}`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
