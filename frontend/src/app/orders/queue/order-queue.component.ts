import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { OrderQueueService, QueueEntry } from '../services/order-queue.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order-queue',
  templateUrl: './order-queue.component.html',
  styleUrls: ['./order-queue.component.scss'],
})
export class OrderQueueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  queueEntries: QueueEntry[] = [];
  currentEntry: QueueEntry | null = null;
  waitingQueue: QueueEntry[] = [];

  queueStats = {
    waiting: 0,
    called: 0,
    processed: 0
  };

  constructor(
    private queueService: OrderQueueService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadQueue();
    this.queueService.startPolling();

    this.queueService.queue$
      .pipe(takeUntil(this.destroy$))
      .subscribe(queue => {
        this.queueEntries = queue;
        this.updateQueueData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.queueService.stopPolling();
  }

  async loadQueue() {
    try {
      const queue = await this.queueService.getQueue().toPromise();
      this.queueEntries = queue || [];
      this.updateQueueData();
    } catch (error) {
      console.error('Error loading queue:', error);
      this.showToast('Error al cargar la cola', 'danger');
    }
  }

  async refreshQueue() {
    await this.loadQueue();
    this.showToast('Cola actualizada');
  }

  updateQueueData() {
    this.currentEntry = this.queueEntries.find(e => e.status === 'called') || null;
    this.waitingQueue = this.queueEntries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.queue_position - b.queue_position;
      });

    this.queueStats = {
      waiting: this.queueEntries.filter(e => e.status === 'waiting').length,
      called: this.queueEntries.filter(e => e.status === 'called').length,
      processed: this.queueEntries.filter(e => e.status === 'processed').length
    };
  }

  async callNext() {
    if (this.currentEntry) {
      const alert = await this.alertCtrl.create({
        header: 'Cliente en Atención',
        message: '¿Desea procesar primero al cliente actual antes de llamar al siguiente?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Procesar Actual',
            handler: async () => {
              await this.markAsProcessed(this.currentEntry!.id);
              setTimeout(() => this.callNext(), 500);
            }
          },
          {
            text: 'Llamar Siguiente',
            handler: () => this.performCallNext()
          }
        ]
      });
      await alert.present();
    } else {
      await this.performCallNext();
    }
  }

  private async performCallNext() {
    try {
      const result = await this.queueService.callNext().toPromise();
      if (result) {
        this.showToast(`Llamando a ${result.order.customer_name}`, 'success');
        await this.loadQueue();
      }
    } catch (error) {
      console.error('Error calling next:', error);
      this.showToast('Error al llamar al siguiente cliente', 'danger');
    }
  }

  async markAsProcessed(entryId: string) {
    try {
      await this.queueService.markAsProcessed(entryId).toPromise();
      this.showToast('Cliente procesado exitosamente', 'success');
      await this.loadQueue();
    } catch (error) {
      console.error('Error marking as processed:', error);
      this.showToast('Error al procesar cliente', 'danger');
    }
  }

  getTypeLabel(type?: string): string {
    const labels: {[key: string]: string} = {
      'orden': 'Orden',
      'pedido': 'Pedido',
      'delivery': 'Delivery',
      'salon': 'Salón'
    };
    return labels[type || ''] || type || '';
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
