// src/app/orders/modals/order-summary.modal.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  ModalController, 
  LoadingController,
  AlertController,
  ToastController 
} from '@ionic/angular';

import { Order, OrderItem, OrderService } from '../services/order.service';
import { OrderQueueService } from '../services/order-queue.service';

export interface OrderSummaryData {
  order: Order;
  includeQueue?: boolean;
  showActions?: boolean;
  title?: string;
}

export interface OrderSummaryResult {
  action: 'confirmed' | 'queue_added' | 'cancelled';
  order?: Order;
  queuePosition?: number;
}

@Component({
  selector: 'app-order-summary-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './order-summary.modal.html',
  styleUrls: ['./order-summary.modal.scss']
})
export class OrderSummaryModal implements OnInit {
  @Input() data!: OrderSummaryData;

  order!: Order;
  processing = false;
  error: string | null = null;

  // Configuración del modal
  includeQueue = false;
  showActions = true;
  modalTitle = 'Resumen de la Orden';

  constructor(
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private orderService: OrderService,
    private queueService: OrderQueueService
  ) {}

  ngOnInit() {
    if (!this.data?.order) {
      console.error('❌ No se proporcionaron datos de orden');
      this.dismiss();
      return;
    }

    this.order = this.data.order;
    this.includeQueue = this.data.includeQueue ?? false;
    this.showActions = this.data.showActions ?? true;
    this.modalTitle = this.data.title ?? 'Resumen de la Orden';

    console.log('📋 Modal de resumen iniciado:', {
      orderCode: this.order.order_code,
      includeQueue: this.includeQueue,
      showActions: this.showActions
    });
  }

  // === ACCIONES PRINCIPALES ===

  /**
   * Confirmar orden
   */
  async confirmOrder() {
    this.processing = true;
    this.error = null;

    const loading = await this.loadingCtrl.create({
      message: 'Confirmando orden...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Actualizar estado de la orden
      const updatedOrder = await this.orderService.updateOrder(this.order.id, {
        status: 'confirmado'
      }).toPromise();

      await loading.dismiss();
      
      const result: OrderSummaryResult = {
        action: 'confirmed',
        order: updatedOrder!
      };

      await this.showToast('Orden confirmada exitosamente', 'success');
      this.modalController.dismiss(result);

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error confirmando orden:', error);
      this.error = 'Error al confirmar la orden: ' + (error.message || 'Error desconocido');
      await this.showToast('Error al confirmar orden', 'danger');
    } finally {
      this.processing = false;
    }
  }

  /**
   * Agregar a cola de atención
   */
  async addToQueue() {
    this.processing = true;
    this.error = null;

    const loading = await this.loadingCtrl.create({
      message: 'Agregando a cola de atención...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Determinar prioridad basada en el tipo de orden
      const priority = this.getOrderPriority(this.order.type);
      
      const queueEntry = await this.queueService.addToQueue(this.order.id, priority).toPromise();
      
      await loading.dismiss();

      const result: OrderSummaryResult = {
        action: 'queue_added',
        order: this.order,
        queuePosition: queueEntry!.queue_position
      };

      await this.showToast(
        `Orden agregada a la cola. Posición: ${queueEntry!.queue_position}`, 
        'success'
      );
      
      this.modalController.dismiss(result);

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error agregando a cola:', error);
      this.error = 'Error al agregar a la cola: ' + (error.message || 'Error desconocido');
      await this.showToast('Error al agregar a cola', 'danger');
    } finally {
      this.processing = false;
    }
  }

  /**
   * Confirmar y agregar a cola en un solo paso
   */
  async confirmAndQueue() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Acción',
      message: '¿Desea confirmar la orden y agregarla a la cola de atención?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, confirmar y agregar',
          handler: async () => {
            await this.confirmOrder();
            // Solo agregar a cola si la confirmación fue exitosa
            if (!this.error) {
              await this.addToQueue();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // === UTILIDADES ===

  /**
   * Obtener prioridad de orden según el tipo
   */
  private getOrderPriority(orderType: string): number {
    const priorities = {
      'salon': 3,      // Mayor prioridad (consumo en local)
      'orden': 2,      // Prioridad media (mostrador)
      'pedido': 1,     // Prioridad baja (pre-order)
      'delivery': 0    // Menor prioridad (delivery)
    };

    return priorities[orderType as keyof typeof priorities] || 1;
  }

  /**
   * Calcular subtotal sin descuentos
   */
  getSubtotal(): number {
    return this.order.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Calcular total de descuentos
   */
  getTotalDiscount(): number {
    let discount = 0;
    
    // Descuento por porcentaje
    if (this.order.discount_percentage > 0) {
      discount += this.getSubtotal() * (this.order.discount_percentage / 100);
    }
    
    // Descuento fijo
    discount += this.order.discount_amount || 0;
    
    return discount;
  }

  /**
   * Calcular total final
   */
  getFinalTotal(): number {
    return Math.max(0, this.getSubtotal() - this.getTotalDiscount());
  }

  /**
   * Formatear cantidad del item
   */
  formatItemQuantity(item: OrderItem): string {
    if (!item.is_weighable) {
      return item.quantity.toString();
    }
    return item.quantity < 1 
      ? `${(item.quantity * 1000).toFixed(0)}g`
      : `${item.quantity.toFixed(3)}kg`;
  }

  /**
   * Obtener ícono del tipo de orden
   */
  getOrderTypeIcon(): string {
    const icons = {
      'orden': 'receipt-outline',
      'pedido': 'time-outline',
      'delivery': 'car-outline',
      'salon': 'restaurant-outline'
    };
    return icons[this.order.type as keyof typeof icons] || 'document-outline';
  }

  /**
   * Obtener color del estado
   */
  getStatusColor(): string {
    const colors = {
      'pendiente': 'warning',
      'confirmado': 'primary',
      'esperando_retiro': 'secondary',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return colors[this.order.status as keyof typeof colors] || 'medium';
  }

  /**
   * Obtener texto del estado
   */
  getStatusText(): string {
    const texts = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'esperando_retiro': 'Esperando Retiro',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return texts[this.order.status as keyof typeof texts] || 'Desconocido';
  }

  /**
   * Verificar si la orden puede ser confirmada
   */
  canConfirmOrder(): boolean {
    return this.order.status === 'pendiente' && !this.processing;
  }

  /**
   * Verificar si la orden puede ser agregada a la cola
   */
  canAddToQueue(): boolean {
    return ['pendiente', 'confirmado'].includes(this.order.status) && !this.processing;
  }

  // === MÉTODOS DE UI ===

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async showOrderDetails() {
    const alert = await this.alertCtrl.create({
      header: `Detalles - ${this.order.order_code}`,
      message: `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${this.order.customer_name}</p>
          ${this.order.customer_phone ? `<p><strong>Teléfono:</strong> ${this.order.customer_phone}</p>` : ''}
          ${this.order.customer_email ? `<p><strong>Email:</strong> ${this.order.customer_email}</p>` : ''}
          ${this.order.delivery_date ? `<p><strong>Fecha de entrega:</strong> ${new Date(this.order.delivery_date).toLocaleString()}</p>` : ''}
          ${this.order.table_number ? `<p><strong>Mesa:</strong> ${this.order.table_number}</p>` : ''}
          ${this.order.delivery_address ? `<p><strong>Dirección:</strong> ${this.order.delivery_address}</p>` : ''}
          <p><strong>Creado:</strong> ${new Date(this.order.created_at).toLocaleString()}</p>
        </div>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  dismiss() {
    const result: OrderSummaryResult = {
      action: 'cancelled'
    };
    this.modalController.dismiss(result);
  }

  trackByItemId(index: number, item: any): string {
  return item?.id || index.toString();
}
}