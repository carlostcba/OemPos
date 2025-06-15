// frontend/src/app/shared/services/order-queue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QueueEntry {
  id: string;
  order_id: string;
  priority: number;
  queue_position: number;
  status: 'waiting' | 'called' | 'processed';
  called_at?: string;
  processed_at?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderQueueService {
  private apiUrl = `${environment.apiUrl}/order-queue`;

  constructor(private http: HttpClient) {}

  getQueue(): Observable<QueueEntry[]> {
    return this.http.get<QueueEntry[]>(this.apiUrl);
  }

  callNext(): Observable<{queueEntry: QueueEntry, order: any}> {
    return this.http.post<any>(`${this.apiUrl}/call-next`, {});
  }

  markAsProcessed(id: string): Observable<QueueEntry> {
    return this.http.post<QueueEntry>(`${this.apiUrl}/${id}/process`, {});
  }
}