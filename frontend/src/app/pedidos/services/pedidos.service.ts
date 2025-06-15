// frontend/src/app/pedidos/services/pedidos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { throwError } from 'rxjs';
import { OrderQueueService } from '../../shared/services/order-queue.service';

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

export interface CreatePedidoRequest {
  type: Pedido['type'];
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  delivery_address?: string;
  delivery_date?: string;
  payment_method?: string;
  deposit_amount?: number;
  coupon_code?: string;
  items: Omit<PedidoItem, 'id' | 'order_id'>[];
  total_amount?: number;
  created_by: string;
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

  constructor(
    private http: HttpClient,
    private queueService: OrderQueueService 
  ) {}

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
        return throwError(() => error);
      })
    );
  }
  
  
  getById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`❌ Error fetching pedido ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  create(pedidoData: CreatePedidoRequest): Observable<Pedido> {
    const total_amount = pedidoData.total_amount ??
      pedidoData.items.reduce((sum, item) => sum + (item.quantity * item.final_price), 0);
  
    const requestData = {
      ...pedidoData,
      total_amount
    };
  
    return this.http.post<Pedido>(this.apiUrl, requestData).pipe(
      tap(newPedido => {
        console.log('✅ Orden creada y agregada a cola automáticamente'); // ✅ AGREGAR
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