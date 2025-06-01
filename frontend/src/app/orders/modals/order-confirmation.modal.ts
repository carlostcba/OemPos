// src/app/orders/modals/order-confirmation.modal.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CreateOrderRequest } from '../services/order.service';
import { CartItem } from '../services/cart.service';

@Component({
  selector: 'app-order-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './order-confirmation.modal.html',
  styleUrls: ['./order-confirmation.modal.scss']
})
export class OrderConfirmationModal {
  @Input() orderData!: CreateOrderRequest;
  @Input() cartItems!: CartItem[];
  @Input() total!: number;
  @Input() appliedDiscount: number = 0;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  confirm() {
    this.modalController.dismiss({ confirmed: true });
  }

  getTotalItems(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  getFinalTotal(): number {
    return this.total - this.appliedDiscount;
  }

  hasSpecialInstructions(): boolean {
    return ['delivery', 'salon', 'pedido'].includes(this.orderData.type);
  }

  formatQuantity(item: CartItem): string {
    if (item.product.is_weighable) {
      return item.quantity < 1 
        ? `${(item.quantity * 1000).toFixed(0)}g`
        : `${item.quantity.toFixed(3)}kg`;
    }
    return item.quantity.toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'orden': 'Orden',
      'pedido': 'Pedido',
      'delivery': 'Delivery',
      'salon': 'Orden de Salón'
    };
    return labels[type] || type;
  }

  getOrderTypeColor(type: string): string {
    const colors: {[key: string]: string} = {
      'orden': 'primary',
      'pedido': 'success',
      'delivery': 'warning',
      'salon': 'secondary'
    };
    return colors[type] || 'primary';
  }

  getPaymentMethodLabel(method?: string): string {
    const labels: {[key: string]: string} = {
      'cash': 'Efectivo',
      'credit': 'Tarjeta de Crédito/Débito',
      'transfer': 'Transferencia Bancaria'
    };
    return labels[method || 'cash'] || method || 'No especificado';
  }
}