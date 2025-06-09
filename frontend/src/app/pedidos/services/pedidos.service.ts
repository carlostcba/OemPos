// frontend/src/app/pedidos/services/pedidos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Pedido {
  id: string;
  order_code: string;
  type: 'orden' | 'pedido' | 'delivery' | 'salon';
  status: 'pendiente' | 'confirmado' | 'esperando_retiro' | 'entregado' | 'cancelado';
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  delivery_address?: string;
  delivery_date?: string;
  total_amount: number;
  deposit_amount?: number;
  discount_percentage?: number;
  discount_amount?: number;
  payment_method?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  items?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  final_price: number;
  quantity: number;
  subtotal: number;
  unit_label: string;
  is_weighable: boolean;
}

export interface PedidoFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  customerName?: string;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // === CRUD OPERATIONS ===

  getAll(filters?: PedidoFilters): Observable<Pedido[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Pedido[]>(this.apiUrl, { params }).pipe(
      tap(pedidos => {
        console.log('📦 Pedidos obtenidos:', pedidos);
        this.pedidosSubject.next(pedidos);
      }),
      catchError(error => {
        console.error('❌ Error fetching pedidos:', error);
        
        // Retornar datos mock en caso de error
        const mockPedidos: Pedido[] = [
          {
            id: '1',
            order_code: 'O001',
            type: 'orden',
            status: 'pendiente',
            customer_name: 'Juan Pérez',
            customer_phone: '+54911234567',
            total_amount: 1500.00,
            created_by: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            order_code: 'P001',
            type: 'pedido',
            status: 'confirmado',
            customer_name: 'María García',
            customer_phone: '+54911234568',
            total_amount: 2300.00,
            created_by: 'admin',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            order_code: 'D001',
            type: 'delivery',
            status: 'esperando_retiro',
            customer_name: 'Carlos López',
            customer_phone: '+54911234569',
            delivery_address: 'Av. Libertador 1234',
            total_amount: 4200.00,
            created_by: 'admin',
            created_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '4',
            order_code: 'S001',
            type: 'salon',
            status: 'entregado',
            customer_name: 'Ana Rodríguez',
            table_number: 'Mesa 5',
            total_amount: 3800.00,
            created_by: 'admin',
            created_at: new Date(Date.now() - 10800000).toISOString()
          },
          {
            id: '5',
            order_code: 'O002',
            type: 'orden',
            status: 'cancelado',
            customer_name: 'Luis Martínez',
            customer_phone: '+54911234570',
            total_amount: 750.00,
            created_by: 'admin',
            created_at: new Date(Date.now() - 14400000).toISOString()
          }
        ];
        
        console.log('🔄 Usando datos mock de pedidos');
        this.pedidosSubject.next(mockPedidos);
        return of(mockPedidos);
      })
    );
  }

  getById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`❌ Error fetching pedido ${id}:`, error);
        
        // Retornar pedido mock
        const mockPedido: Pedido = {
          id,
          order_code: 'O001',
          type: 'orden',
          status: 'pendiente',
          customer_name: 'Cliente Mock',
          total_amount: 1000.00,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          items: [
            {
              id: '1',
              order_id: id,
              product_id: '1',
              product_name: 'Producto Mock',
              unit_price: 500.00,
              final_price: 500.00,
              quantity: 2,
              subtotal: 1000.00,
              unit_label: 'unidad',
              is_weighable: false
            }
          ]
        };
        
        return of(mockPedido);
      })
    );
  }

  create(pedidoData: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedidoData).pipe(
      tap(newPedido => {
        const currentPedidos = this.pedidosSubject.value;
        this.pedidosSubject.next([newPedido, ...currentPedidos]);
      }),
      catchError(error => {
        console.error('❌ Error creating pedido:', error);
        throw error;
      })
    );
  }

  update(id: string, updateData: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, updateData).pipe(
      tap(updatedPedido => {
        const currentPedidos = this.pedidosSubject.value;
        const index = currentPedidos.findIndex(pedido => pedido.id === id);
        if (index !== -1) {
          currentPedidos[index] = updatedPedido;
          this.pedidosSubject.next([...currentPedidos]);
        }
      }),
      catchError(error => {
        console.error(`❌ Error updating pedido ${id}:`, error);
        
        // Simular actualización exitosa para desarrollo
        const currentPedidos = this.pedidosSubject.value;
        const index = currentPedidos.findIndex(pedido => pedido.id === id);
        if (index !== -1) {
          currentPedidos[index] = { ...currentPedidos[index], ...updateData };
          this.pedidosSubject.next([...currentPedidos]);
          return of(currentPedidos[index]);
        }
        
        throw error;
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentPedidos = this.pedidosSubject.value;
        const filteredPedidos = currentPedidos.filter(pedido => pedido.id !== id);
        this.pedidosSubject.next(filteredPedidos);
      }),
      catchError(error => {
        console.error(`❌ Error deleting pedido ${id}:`, error);
        throw error;
      })
    );
  }

  // === SEARCH OPERATIONS ===

  search(searchParams: {
    term?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
    customerName?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Observable<Pedido[]> {
    let params = new HttpParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Pedido[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('❌ Error searching pedidos:', error);
        // Retornar resultados actuales como fallback
        return this.pedidos$;
      })
    );
  }

  // === UTILITY METHODS ===

  refreshPedidos(filters?: PedidoFilters): Observable<Pedido[]> {
    return this.getAll(filters);
  }

  clearCache(): void {
    this.pedidosSubject.next([]);
  }

  generatePedidoCode(type: Pedido['type']): string {
    const prefix = {
      'orden': 'O',
      'pedido': 'P', 
      'delivery': 'D',
      'salon': 'S'
    }[type];

    const today = new Date();
    const count = this.pedidosSubject.value.filter(pedido => {
      const pedidoDate = new Date(pedido.created_at);
      return pedido.type === type && 
             pedidoDate.toDateString() === today.toDateString();
    }).length;

    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  }
}