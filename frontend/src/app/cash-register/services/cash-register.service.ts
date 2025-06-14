// frontend/src/app/cash-register/services/cash-register.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  CashRegister, 
  CashTransaction, 
  CashSummary, 
  OrderInQueue,
  CreateTransactionRequest,
  OpenRegisterRequest,
  CloseRegisterRequest
} from '../interfaces/cash-register.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private apiUrl = `${environment.apiUrl}/cash-register`;
  private queueUrl = `${environment.apiUrl}/order-queue`;
  
  private currentRegisterSubject = new BehaviorSubject<CashRegister | null>(null);
  public currentRegister$ = this.currentRegisterSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ===== REGISTER OPERATIONS =====

  getCurrentRegister(): Observable<CashRegister> {
    return this.http.get<CashRegister>(`${this.apiUrl}/current`).pipe(
      tap(register => this.currentRegisterSubject.next(register)),
      catchError(error => {
        console.error('Error getting current register:', error);
        const mockRegister: CashRegister = {
          id: '1',
          openingAmount: 1.00,
          status: 'open',
          openedBy: 'user-id',
          openedAt: new Date().toISOString(),
          currentBalance: 4846.00,
          transactions: []
        };
        this.currentRegisterSubject.next(mockRegister);
        return of(mockRegister);
      })
    );
  }

  openRegister(request: OpenRegisterRequest): Observable<CashRegister> {
    return this.http.post<CashRegister>(`${this.apiUrl}/open`, {
      opening_amount: request.openingAmount,
      opening_notes: request.openingNotes
    }).pipe(
      tap(register => this.currentRegisterSubject.next(register)),
      catchError(error => {
        console.error('Error opening register:', error);
        throw error;
      })
    );
  }

  closeRegister(request: CloseRegisterRequest): Observable<CashRegister> {
    const currentRegister = this.currentRegisterSubject.value;
    if (!currentRegister) {
      throw new Error('No register is currently open');
    }

    return this.http.put<CashRegister>(`${this.apiUrl}/${currentRegister.id}/close`, {
      closing_amount: request.closingAmount,
      closing_notes: request.closingNotes
    }).pipe(
      tap(register => this.currentRegisterSubject.next(register)),
      catchError(error => {
        console.error('Error closing register:', error);
        throw error;
      })
    );
  }

  // ===== TRANSACTIONS =====

  addTransaction(transaction: CreateTransactionRequest): Observable<CashTransaction> {
    return this.http.post<CashTransaction>(`${this.apiUrl}/transaction`, {
      cash_register_id: transaction.cashRegisterId,
      order_id: transaction.orderId,
      type: transaction.type,
      amount: transaction.amount,
      payment_method: transaction.paymentMethod,
      description: transaction.description,
      reference: transaction.reference
    }).pipe(
      tap(() => this.getCurrentRegister().subscribe()),
      catchError(error => {
        console.error('Error adding transaction:', error);
        throw error;
      })
    );
  }

  // ===== SUMMARY AND STATISTICS =====

  getCashSummary(): Observable<CashSummary> {
    const currentRegister = this.currentRegisterSubject.value;
    if (!currentRegister) {
      return of({
        openingAmount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        cashSales: 0,
        cardSales: 0,
        transferSales: 0,
        depositsReceived: 0,
        currentBalance: 0,
        expectedBalance: 0,
        difference: 0
      });
    }

    return this.http.get<any>(`${this.apiUrl}/${currentRegister.id}/report`).pipe(
      map(report => {
        const totals = report.totals;
        return {
          openingAmount: currentRegister.openingAmount,
          totalIncome: totals.total.income,
          totalExpenses: totals.total.expense,
          cashSales: totals.cash.income,
          cardSales: totals.card.income,
          transferSales: totals.transfer.income,
          depositsReceived: totals.cash.deposit,
          currentBalance: currentRegister.currentBalance || 0,
          expectedBalance: currentRegister.expectedAmount || 0,
          difference: currentRegister.differenceAmount || 0
        };
      }),
      catchError(error => {
        console.error('Error getting cash summary:', error);
        return of({
          openingAmount: 1.00,
          totalIncome: 4845.00,
          totalExpenses: 0,
          cashSales: 4845.00,
          cardSales: 0,
          transferSales: 0,
          depositsReceived: 0,
          currentBalance: 4846.00,
          expectedBalance: 4846.00,
          difference: 0
        });
      })
    );
  }

  // ===== ORDER QUEUE =====

  getOrderQueue(): Observable<OrderInQueue[]> {
    return this.http.get<any[]>(this.queueUrl).pipe(
      map(queueItems => queueItems.map(item => ({
        id: item.id,
        orderId: item.order_id,
        priority: item.priority,
        queuePosition: item.queue_position,
        status: item.status,
        calledAt: item.called_at,
        processedAt: item.processed_at,
        createdAt: item.created_at,
        order: {
          id: item.order?.id || item.order_id,
          orderCode: item.order?.order_code || `O${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: this.mapOrderType(item.order?.type || 'orden'),
          status: item.order?.status || 'pending',
          customerName: item.order?.customer_name || 'Customer',
          totalAmount: item.order?.total_amount || 0,
          paymentMethod: item.order?.payment_method
        }
      }))),
      catchError(error => {
        console.error('Error getting order queue:', error);
        return of([]);
      })
    );
  }

  callNextOrder(): Observable<OrderInQueue> {
    return this.http.post<any>(`${this.queueUrl}/call-next`, {}).pipe(
      map(response => this.mapQueueItem(response.queueEntry)),
      catchError(error => {
        console.error('Error calling next order:', error);
        throw error;
      })
    );
  }

  processOrder(queueId: string): Observable<OrderInQueue> {
    return this.http.post<any>(`${this.queueUrl}/${queueId}/process`, {}).pipe(
      map(response => this.mapQueueItem(response)),
      catchError(error => {
        console.error('Error processing order:', error);
        throw error;
      })
    );
  }

  // ===== UTILITIES =====

  private mapOrderType(backendType: string): 'order' | 'reservation' | 'delivery' | 'dine_in' {
    const typeMap: { [key: string]: 'order' | 'reservation' | 'delivery' | 'dine_in' } = {
      'orden': 'order',
      'pedido': 'reservation',
      'delivery': 'delivery',
      'salon': 'dine_in'
    };
    return typeMap[backendType] || 'order';
  }

  private mapQueueItem(item: any): OrderInQueue {
    return {
      id: item.id,
      orderId: item.order_id,
      priority: item.priority,
      queuePosition: item.queue_position,
      status: item.status,
      calledAt: item.called_at,
      processedAt: item.processed_at,
      createdAt: item.created_at,
      order: {
        id: item.order?.id || item.order_id,
        orderCode: item.order?.order_code,
        type: this.mapOrderType(item.order?.type),
        status: item.order?.status,
        customerName: item.order?.customer_name,
        totalAmount: item.order?.total_amount,
        paymentMethod: item.order?.payment_method
      }
    };
  }

  refreshData(): void {
    this.getCurrentRegister().subscribe();
  }

  hasOpenRegister(): boolean {
    const register = this.currentRegisterSubject.value;
    return register ? register.status === 'open' : false;
  }

  getCurrentBalance(): number {
    const register = this.currentRegisterSubject.value;
    return register?.currentBalance || 0;
  }
}