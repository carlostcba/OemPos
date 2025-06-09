// src/app/orders/services/order-queue.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, timer } from 'rxjs';
import { map, tap, catchError, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order } from './order.service';

export interface QueueEntry {
  id: string;
  order_id: string;
  priority: number;
  queue_position: number;
  status: 'waiting' | 'called' | 'processed';
  called_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at?: string;
  // Datos de la orden asociada
  order?: Order;
}

export interface CallNextResponse {
  queueEntry: QueueEntry;
  order: Order;
}

export interface QueueStats {
  total_waiting: number;
  total_called: number;
  total_processed: number;
  average_wait_time: number;
  current_position: number;
  estimated_wait_time: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderQueueService {
  private apiUrl = `${environment.apiUrl}/order-queue`;
  
  // Subjects para estado reactivo
  private queueSubject = new BehaviorSubject<QueueEntry[]>([]);
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  private statsSubject = new BehaviorSubject<QueueStats | null>(null);
  
  // Observables públicos
  public queue$ = this.queueSubject.asObservable();
  public currentOrder$ = this.currentOrderSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  
  // Control de polling
  private pollingInterval: any;
  private isPolling = false;

  constructor(private http: HttpClient) {}

  // === GESTIÓN DE COLA ===

  /**
   * Obtener toda la cola de órdenes
   */
  getQueue(): Observable<QueueEntry[]> {
    return this.http.get<QueueEntry[]>(this.apiUrl)
      .pipe(
        tap(queue => {
          console.log('🔄 Cola actualizada:', queue.length, 'entradas');
          this.queueSubject.next(queue);
          this.updateStats(queue);
        }),
        catchError(error => {
          console.error('❌ Error al obtener cola:', error);
          throw error;
        })
      );
  }

  /**
   * Agregar una orden a la cola
   */
  addToQueue(orderId: string, priority: number = 0): Observable<QueueEntry> {
    const payload = { order_id: orderId, priority };
    
    return this.http.post<QueueEntry>(this.apiUrl, payload)
      .pipe(
        tap(entry => {
          console.log('✅ Orden agregada a la cola:', entry.order_id, 'posición:', entry.queue_position);
          // Actualizar cola local
          const currentQueue = this.queueSubject.value;
          this.queueSubject.next([...currentQueue, entry]);
        }),
        catchError(error => {
          console.error('❌ Error al agregar a cola:', error);
          throw error;
        })
      );
  }

  /**
   * Llamar al siguiente cliente en la cola
   */
  callNext(): Observable<CallNextResponse> {
    return this.http.post<CallNextResponse>(`${this.apiUrl}/call-next`, {})
      .pipe(
        tap(response => {
          console.log('📢 Siguiente cliente llamado:', response.order.order_code);
          this.currentOrderSubject.next(response.order);
          
          // Actualizar cola local
          const currentQueue = this.queueSubject.value;
          const updatedQueue = currentQueue.map(entry => 
            entry.id === response.queueEntry.id 
              ? { ...entry, status: 'called' as const, called_at: new Date().toISOString() }
              : entry
          );
          this.queueSubject.next(updatedQueue);
        }),
        catchError(error => {
          console.error('❌ Error al llamar siguiente:', error);
          throw error;
        })
      );
  }

  /**
   * Marcar una orden como procesada
   */
  markAsProcessed(queueEntryId: string): Observable<QueueEntry> {
    return this.http.post<QueueEntry>(`${this.apiUrl}/${queueEntryId}/process`, {})
      .pipe(
        tap(entry => {
          console.log('✅ Orden procesada:', entry.order_id);
          
          // Actualizar cola local
          const currentQueue = this.queueSubject.value;
          const updatedQueue = currentQueue.map(q => 
            q.id === queueEntryId 
              ? { ...q, status: 'processed' as const, processed_at: new Date().toISOString() }
              : q
          );
          this.queueSubject.next(updatedQueue);
          
          // Limpiar orden actual si es la que se procesó
          const currentOrder = this.currentOrderSubject.value;
          if (currentOrder && entry.order_id === currentOrder.id) {
            this.currentOrderSubject.next(null);
          }
        }),
        catchError(error => {
          console.error('❌ Error al marcar como procesada:', error);
          throw error;
        })
      );
  }

  /**
   * Reordenar la cola
   */
  reorderQueue(entries: QueueEntry[]): Observable<QueueEntry[]> {
    const reorderData = {
      entries: entries.map((entry, index) => ({
        id: entry.id,
        queue_position: index + 1
      }))
    };

    return this.http.post<QueueEntry[]>(`${this.apiUrl}/reorder`, reorderData)
      .pipe(
        tap(updatedQueue => {
          console.log('🔄 Cola reordenada:', updatedQueue.length, 'entradas');
          this.queueSubject.next(updatedQueue);
        }),
        catchError(error => {
          console.error('❌ Error al reordenar cola:', error);
          throw error;
        })
      );
  }

  /**
   * Eliminar una entrada de la cola
   */
  removeFromQueue(queueEntryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${queueEntryId}`)
      .pipe(
        tap(() => {
          console.log('🗑️ Entrada eliminada de la cola:', queueEntryId);
          
          // Actualizar cola local
          const currentQueue = this.queueSubject.value;
          const filteredQueue = currentQueue.filter(entry => entry.id !== queueEntryId);
          this.queueSubject.next(filteredQueue);
        }),
        catchError(error => {
          console.error('❌ Error al eliminar de cola:', error);
          throw error;
        })
      );
  }

  // === POLLING Y TIEMPO REAL ===

  /**
   * Iniciar polling automático de la cola
   */
  startPolling(intervalMs: number = 10000): void {
    if (this.isPolling) {
      this.stopPolling();
    }

    console.log('🔄 Iniciando polling de cola cada', intervalMs, 'ms');
    this.isPolling = true;
    
    this.pollingInterval = interval(intervalMs)
      .pipe(
        switchMap(() => this.getQueue()),
        catchError(error => {
          console.error('❌ Error en polling:', error);
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Detener polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('⏹️ Polling detenido');
  }

  // === ESTADÍSTICAS Y UTILIDADES ===

  /**
   * Obtener estadísticas de la cola
   */
  getQueueStats(): Observable<QueueStats> {
    return this.queue$.pipe(
      map(queue => this.calculateStats(queue)),
      tap(stats => this.statsSubject.next(stats))
    );
  }

  /**
   * Calcular estadísticas de la cola
   */
  private calculateStats(queue: QueueEntry[]): QueueStats {
    const waiting = queue.filter(entry => entry.status === 'waiting');
    const called = queue.filter(entry => entry.status === 'called');
    const processed = queue.filter(entry => entry.status === 'processed');

    // Calcular tiempo promedio de espera (simplificado)
    const averageWaitTime = this.calculateAverageWaitTime(processed);
    
    // Estimar tiempo de espera para el siguiente
    const estimatedWaitTime = waiting.length > 0 ? waiting.length * 5 : 0; // 5 min por orden

    return {
      total_waiting: waiting.length,
      total_called: called.length,
      total_processed: processed.length,
      average_wait_time: averageWaitTime,
      current_position: waiting.length > 0 ? 1 : 0,
      estimated_wait_time: estimatedWaitTime
    };
  }

  /**
   * Calcular tiempo promedio de espera
   */
  private calculateAverageWaitTime(processedEntries: QueueEntry[]): number {
    if (processedEntries.length === 0) return 0;

    const totalWaitTime = processedEntries.reduce((total, entry) => {
      if (entry.called_at && entry.processed_at) {
        const waitTime = new Date(entry.processed_at).getTime() - new Date(entry.called_at).getTime();
        return total + (waitTime / 1000 / 60); // Convertir a minutos
      }
      return total;
    }, 0);

    return Math.round(totalWaitTime / processedEntries.length);
  }

  /**
   * Actualizar estadísticas
   */
  private updateStats(queue: QueueEntry[]): void {
    const stats = this.calculateStats(queue);
    this.statsSubject.next(stats);
  }

  /**
   * Obtener posición de una orden en la cola
   */
  getOrderPosition(orderId: string): Observable<number> {
    return this.queue$.pipe(
      map(queue => {
        const entry = queue.find(e => e.order_id === orderId && e.status === 'waiting');
        return entry ? entry.queue_position : -1;
      })
    );
  }

  /**
   * Verificar si una orden está en la cola
   */
  isOrderInQueue(orderId: string): Observable<boolean> {
    return this.queue$.pipe(
      map(queue => queue.some(entry => 
        entry.order_id === orderId && entry.status !== 'processed'
      ))
    );
  }

  /**
   * Obtener tiempo estimado de espera para una orden
   */
  getEstimatedWaitTime(orderId: string): Observable<number> {
    return this.queue$.pipe(
      map(queue => {
        const waitingEntries = queue.filter(entry => entry.status === 'waiting');
        const orderEntry = waitingEntries.find(entry => entry.order_id === orderId);
        
        if (!orderEntry) return 0;
        
        const position = waitingEntries.findIndex(entry => entry.id === orderEntry.id);
        return position * 5; // 5 minutos por orden (estimación)
      })
    );
  }

  // === MÉTODOS DE LIMPIEZA ===

  /**
   * Limpiar cola de entradas procesadas
   */
  cleanupProcessedEntries(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cleanup`, {})
      .pipe(
        tap(() => {
          console.log('🧹 Cola limpiada de entradas procesadas');
          // Refrescar cola
          this.getQueue().subscribe();
        }),
        catchError(error => {
          console.error('❌ Error al limpiar cola:', error);
          throw error;
        })
      );
  }

  /**
   * Resetear toda la cola
   */
  resetQueue(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, {})
      .pipe(
        tap(() => {
          console.log('🔄 Cola reseteada completamente');
          this.queueSubject.next([]);
          this.currentOrderSubject.next(null);
          this.statsSubject.next(null);
        }),
        catchError(error => {
          console.error('❌ Error al resetear cola:', error);
          throw error;
        })
      );
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopPolling();
  }
}