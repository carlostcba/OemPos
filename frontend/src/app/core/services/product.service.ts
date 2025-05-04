// frontend/src/app/core/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Producto {
  id: string;
  name: string;
  price: number;
  plu_code?: string;
  stock: number;
  description?: string;
  category?: any;
  subcategory?: any;
  is_active: boolean;
  is_weighable: boolean;
  unit_label: string;
  track_stock: boolean;
  category_id?: string;
  subcategory_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error obteniendo productos:', error);
        return throwError(() => error);
      })
    );
  }

  // Buscar productos
  searchProducts(term: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?search=${term}`).pipe(
      catchError(error => {
        console.error('Error en búsqueda de productos:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener un producto por ID
  getProductById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error obteniendo producto ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Crear un nuevo producto
  createProduct(product: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product).pipe(
      catchError(error => {
        console.error('Error creando producto:', error);
        return throwError(() => error);
      })
    );
  }

  // Actualizar un producto existente
  updateProduct(id: string, product: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(error => {
        console.error(`Error actualizando producto ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error eliminando producto ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}