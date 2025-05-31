import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categoria {
  id: string;
  name: string;
  subcategories?: Subcategoria[];
}

export interface Subcategoria {
  id: string;
  name: string;
  category_id: string;
  category?: Categoria;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categories`);
  }

  getSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.apiUrl}/subcategories`);
  }

  getSubcategoriasPorCategoria(categoryId: string): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.apiUrl}/subcategories?category_id=${categoryId}`);
  }

  createCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categories`, categoria);
  }

  createSubcategoria(subcategoria: Partial<Subcategoria>): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(`${this.apiUrl}/subcategories`, subcategoria);
  }

  updateCategoria(id: string, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/categories/${id}`, categoria);
  }

  updateSubcategoria(id: string, subcategoria: Partial<Subcategoria>): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.apiUrl}/subcategories/${id}`, subcategoria);
  }

  deleteCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  deleteSubcategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subcategories/${id}`);
  }
}