// frontend/src/app/cash-register/pipes/cash-format.pipes.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cashAmount',
  standalone: true
})
export class CashAmountPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}

@Pipe({
  name: 'orderType',
  standalone: true
})
export class OrderTypePipe implements PipeTransform {
  transform(type: string): string {
    const typeMap: { [key: string]: string } = {
      'order': 'Order',
      'reservation': 'Reservation',
      'delivery': 'Delivery',
      'dine_in': 'Dine In'
    };
    return typeMap[type] || type;
  }
}

@Pipe({
  name: 'orderStatus',
  standalone: true
})
export class OrderStatusPipe implements PipeTransform {
  transform(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'waiting_pickup': 'Waiting Pickup',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'waiting': 'Waiting',
      'called': 'Called',
      'processed': 'Processed'
    };
    return statusMap[status] || status;
  }
}