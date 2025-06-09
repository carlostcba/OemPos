// 4. src/app/shared/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  
  // Reactive states
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  
  private subcategoriesSubject = new BehaviorSubject<Subcategory[]>([]);
  public subcategories$ = this.subcategoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load initial data
    this.loadInitialData();
  }

  // ========== CATEGORIES ==========

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`)
      .pipe(
        tap(categories => {
          this.categoriesSubject.next(categories);
        }),
        catchError(this.handleError)
      );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`)
      .pipe(catchError(this.handleError));
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category)
      .pipe(
        tap(newCategory => {
          const current = this.categoriesSubject.value;
          this.categoriesSubject.next([...current, newCategory]);
        }),
        catchError(this.handleError)
      );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category)
      .pipe(
        tap(updatedCategory => {
          const current = this.categoriesSubject.value;
          const updated = current.map(cat => 
            cat.id === id ? updatedCategory : cat
          );
          this.categoriesSubject.next(updated);
        }),
        catchError(this.handleError)
      );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`)
      .pipe(
        tap(() => {
          const current = this.categoriesSubject.value;
          const filtered = current.filter(cat => cat.id !== id);
          this.categoriesSubject.next(filtered);
        }),
        catchError(this.handleError)
      );
  }

  // ========== SUBCATEGORIES ==========

  getSubcategories(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories`)
      .pipe(
        tap(subcategories => {
          this.subcategoriesSubject.next(subcategories);
        }),
        catchError(this.handleError)
      );
  }

  getSubcategoriesByCategory(categoryId: string): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories?category_id=${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  getSubcategoryById(id: string): Observable<Subcategory> {
    return this.http.get<Subcategory>(`${this.apiUrl}/subcategories/${id}`)
      .pipe(catchError(this.handleError));
  }

  createSubcategory(subcategory: Omit<Subcategory, 'id'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/subcategories`, subcategory)
      .pipe(
        tap(newSubcategory => {
          const current = this.subcategoriesSubject.value;
          this.subcategoriesSubject.next([...current, newSubcategory]);
        }),
        catchError(this.handleError)
      );
  }

  updateSubcategory(id: string, subcategory: Partial<Subcategory>): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${id}`, subcategory)
      .pipe(
        tap(updatedSubcategory => {
          const current = this.subcategoriesSubject.value;
          const updated = current.map(sub => 
            sub.id === id ? updatedSubcategory : sub
          );
          this.subcategoriesSubject.next(updated);
        }),
        catchError(this.handleError)
      );
  }

  deleteSubcategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${id}`)
      .pipe(
        tap(() => {
          const current = this.subcategoriesSubject.value;
          const filtered = current.filter(sub => sub.id !== id);
          this.subcategoriesSubject.next(filtered);
        }),
        catchError(this.handleError)
      );
  }

  // ========== UTILITY METHODS ==========

  // Get subcategories filtered by category (from local state)
  getSubcategoriesForCategory(categoryId: string): Observable<Subcategory[]> {
    return this.subcategories$.pipe(
      map(subcategories => 
        subcategories.filter(sub => sub.category_id === categoryId)
      )
    );
  }

  // Load initial data
  private loadInitialData(): void {
    // Load categories and subcategories on service initialization
    this.getCategories().subscribe();
    this.getSubcategories().subscribe();
  }

  // Mock data for development (when backend is not available)
  getMockCategories(): Observable<Category[]> {
    const mockCategories: Category[] = [
      { id: '1', name: 'Bakery', description: 'Bread and baked goods' },
      { id: '2', name: 'Pastry', description: 'Cakes and desserts' },
      { id: '3', name: 'Beverages', description: 'Drinks and liquids' },
      { id: '4', name: 'Dairy', description: 'Milk products' },
      { id: '5', name: 'Meat', description: 'Fresh meat products' }
    ];
    
    this.categoriesSubject.next(mockCategories);
    return of(mockCategories);
  }

  getMockSubcategories(): Observable<Subcategory[]> {
    const mockSubcategories: Subcategory[] = [
      { id: '1', name: 'Sweet Bread', category_id: '1' },
      { id: '2', name: 'Savory Bread', category_id: '1' },
      { id: '3', name: 'Cakes', category_id: '2' },
      { id: '4', name: 'Cookies', category_id: '2' },
      { id: '5', name: 'Hot Drinks', category_id: '3' },
      { id: '6', name: 'Cold Drinks', category_id: '3' },
      { id: '7', name: 'Milk', category_id: '4' },
      { id: '8', name: 'Cheese', category_id: '4' },
      { id: '9', name: 'Beef', category_id: '5' },
      { id: '10', name: 'Chicken', category_id: '5' }
    ];
    
    this.subcategoriesSubject.next(mockSubcategories);
    return of(mockSubcategories);
  }

  // Refresh data
  refreshData(): Observable<[Category[], Subcategory[]]> {
    return forkJoin([
      this.getCategories(),
      this.getSubcategories()
    ]);
  }

  // Clear state
  clearState(): void {
    this.categoriesSubject.next([]);
    this.subcategoriesSubject.next([]);
  }

  // Error handling
  private handleError = (error: any): Observable<never> => {
    console.error('CategoryService Error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized access';
          break;
        case 404:
          errorMessage = 'Category not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    throw new Error(errorMessage);
  };

  // Debug information
  getDebugInfo(): any {
    return {
      categoriesCount: this.categoriesSubject.value.length,
      subcategoriesCount: this.subcategoriesSubject.value.length,
      apiUrl: this.apiUrl
    };
  }
}

// Import missing operators
import { map, forkJoin } from 'rxjs';