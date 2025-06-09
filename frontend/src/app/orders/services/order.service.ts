// src/app/orders/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// === INTERFACES ===

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  final_price: number;
  subtotal: number;
  unit_label: string;
  is_weighable: boolean;
  discount_applied?: number;
  coupon_code?: string;
}

export interface Order {
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
  deposit_amount: number;
  discount_percentage: number;
  discount_amount: number;
  total_amount_with_discount?: number;
  payment_method?: string;
  total_cash_paid: number;
  total_non_cash_paid: number;
  first_payment_date?: string;
  last_payment_date?: string;
  coupon_code?: string;
  created_by: string;
  cash_register_id?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  type: 'orden' | 'pedido' | 'delivery' | 'salon';
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  delivery_address?: string;
  delivery_date?: string;
  payment_method?: string;
  deposit_amount?: number;
  coupon_code?: string;
  items: Omit<OrderItem, 'id'>[];
}

export interface UpdateOrderRequest {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_date?: string;
  status?: string;
  total_amount?: number;
  items?: any[];
  replaceItems?: boolean;
}

export interface OrderFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  customer_name?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CouponApplicationRequest {
  coupon_code: string;
  payment_method?: string;
}

// === SERVICE ===

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // === CRUD OPERATIONS ===

  /**
   * Obtener todas las órdenes con filtros opcionales
   */
  getOrders(filters?: OrderFilters): Observable<Order[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Order[]>(this.apiUrl, { params })
      .pipe(
        tap(orders => {
          console.log('✅ Órdenes cargadas:', orders.length);
          this.ordersSubject.next(orders);
        })
      );
  }

  /**
   * Obtener una orden por ID
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(order => console.log('✅ Orden cargada:', order.order_code))
      );
  }

  /**
   * Crear una nueva orden
   */
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    // Calcular total automáticamente
    const total_amount = orderData.items.reduce((sum, item) => 
      sum + (item.quantity * item.final_price), 0
    );

    const requestData = {
      ...orderData,
      total_amount,
      created_by: this.getCurrentUserId() // Obtener del auth service
    };

    console.log('🚀 Creando orden:', requestData);

    return this.http.post<Order>(this.apiUrl, requestData)
      .pipe(
        tap(order => {
          console.log('✅ Orden creada:', order.order_code);
          // Actualizar lista local
          const currentOrders = this.ordersSubject.value;
          this.ordersSubject.next([order, ...currentOrders]);
        })
      );
  }

  /**
   * Actualizar una orden existente
   */
  updateOrder(id: string, updateData: UpdateOrderRequest): Observable<Order> {
    console.log('📝 Actualizando orden:', id, updateData);

    return this.http.put<Order>(`${this.apiUrl}/${id}`, updateData)
      .pipe(
        tap(updatedOrder => {
          console.log('✅ Orden actualizada:', updatedOrder.order_code);
          // Actualizar lista local
          const currentOrders = this.ordersSubject.value;
          const index = currentOrders.findIndex(o => o.id === id);
          if (index !== -1) {
            currentOrders[index] = updatedOrder;
            this.ordersSubject.next([...currentOrders]);
          }
        })
      );
  }

  /**
   * Eliminar una orden
   */
  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          console.log('🗑️ Orden eliminada:', id);
          // Actualizar lista local
          const currentOrders = this.ordersSubject.value;
          const filteredOrders = currentOrders.filter(o => o.id !== id);
          this.ordersSubject.next(filteredOrders);
        })
      );
  }

  // === OPERACIONES ESPECIALES ===

  /**
   * Aplicar cupón a una orden
   */
  applyCoupon(orderId: string, couponData: CouponApplicationRequest): Observable<Order> {
    console.log('🎟️ Aplicando cupón:', orderId, couponData);

    return this.http.post<Order>(`${this.apiUrl}/${orderId}/apply-coupon`, couponData)
      .pipe(
        tap(order => {
          console.log('✅ Cupón aplicado:', order.coupon_code);
          // Actualizar lista local
          const currentOrders = this.ordersSubject.value;
          const index = currentOrders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            currentOrders[index] = order;
            this.ordersSubject.next([...currentOrders]);
          }
        })
      );
  }

  /**
   * Buscar órdenes
   */
  searchOrders(searchParams: any): Observable<Order[]> {
    let params = new HttpParams();
    
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Order[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        tap(orders => console.log('🔍 Resultados de búsqueda:', orders.length))
      );
  }

  /**
   * Obtener estadísticas de órdenes
   */
  getOrderStats(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/stats`, { params })
      .pipe(
        tap(stats => console.log('📊 Estadísticas cargadas:', stats))
      );
  }

  // === UTILIDADES ===

  /**
   * Generar código de orden según el tipo
   */
  generateOrderCode(type: string, count: number): string {
    const prefixes = {
      'orden': 'O',
      'pedido': 'P', 
      'delivery': 'D',
      'salon': 'S'
    };

    const prefix = prefixes[type as keyof typeof prefixes] || 'O';
    const number = (count + 1).toString().padStart(3, '0');
    
    return `${prefix}${number}`;
  }

  /**
   * Calcular total con descuentos
   */
  calculateTotalWithDiscount(subtotal: number, discountPercentage: number, discountAmount: number): number {
    let total = subtotal;
    
    if (discountPercentage > 0) {
      total = total - (total * discountPercentage / 100);
    }
    
    if (discountAmount > 0) {
      total = Math.max(0, total - discountAmount);
    }
    
    return Math.round(total * 100) / 100;
  }

  /**
   * Formatear estado de orden para mostrar
   */
  getStatusDisplay(status: string): { text: string; color: string } {
    const statusMap = {
      'pendiente': { text: 'Pendiente', color: 'warning' },
      'confirmado': { text: 'Confirmado', color: 'primary' },
      'esperando_retiro': { text: 'Esperando Retiro', color: 'secondary' },
      'entregado': { text: 'Entregado', color: 'success' },
      'cancelado': { text: 'Cancelado', color: 'danger' }
    };

    return statusMap[status as keyof typeof statusMap] || { text: 'Desconocido', color: 'medium' };
  }

  /**
   * Formatear tipo de orden para mostrar
   */
  getTypeDisplay(type: string): { text: string; icon: string } {
    const typeMap = {
      'orden': { text: 'Orden', icon: 'receipt-outline' },
      'pedido': { text: 'Pedido', icon: 'time-outline' },
      'delivery': { text: 'Delivery', icon: 'car-outline' },
      'salon': { text: 'Salón', icon: 'restaurant-outline' }
    };

    return typeMap[type as keyof typeof typeMap] || { text: 'Desconocido', icon: 'document-outline' };
  }

  /**
   * Validar si una orden puede ser editada
   */
  canEditOrder(order: Order, userRole: string): boolean {
    if (userRole !== 'seller') return false;
    if (order.status === 'cancelado' || order.status === 'entregado') return false;
    return true;
  }

  /**
   * Validar si una orden puede ser cancelada
   */
  canCancelOrder(order: Order, userRole: string): boolean {
    if (order.status === 'cancelado' || order.status === 'entregado') return false;
    if (userRole === 'cashier' && order.status !== 'pendiente') return false;
    return true;
  }

  // === HELPERS PRIVADOS ===

  private getCurrentUserId(): string {
    // TODO: Integrar con AuthService para obtener el ID del usuario actual
    // Por ahora retornamos un valor temporal
    return localStorage.getItem('userId') || 'temp-user-id';
  }

  /**
   * Limpiar caché local
   */
  clearCache(): void {
    this.ordersSubject.next([]);
  }

  /**
   * Refrescar órdenes
   */
  refreshOrders(filters?: OrderFilters): Observable<Order[]> {
    return this.getOrders(filters);
  }
}