// src/app/orders/pipes/order-status.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

export interface StatusDisplay {
  text: string;
  color: string;
  icon: string;
}

@Pipe({
  name: 'orderStatus',
  pure: true
})
export class OrderStatusPipe implements PipeTransform {

  private statusMap: { [key: string]: StatusDisplay } = {
    'pendiente': {
      text: 'Pendiente',
      color: 'warning',
      icon: 'hourglass-outline'
    },
    'confirmado': {
      text: 'Confirmado',
      color: 'primary',
      icon: 'checkmark-circle-outline'
    },
    'esperando_retiro': {
      text: 'Esperando Retiro',
      color: 'secondary',
      icon: 'time-outline'
    },
    'entregado': {
      text: 'Entregado',
      color: 'success',
      icon: 'checkmark-done-outline'
    },
    'cancelado': {
      text: 'Cancelado',
      color: 'danger',
      icon: 'close-circle-outline'
    }
  };

  transform(status: string): StatusDisplay;
  transform(status: string, property: 'text'): string;
  transform(status: string, property: 'color'): string;
  transform(status: string, property: 'icon'): string;
  transform(status: string, property?: keyof StatusDisplay): StatusDisplay | string {
    const statusDisplay = this.statusMap[status] || {
      text: 'Desconocido',
      color: 'medium',
      icon: 'help-circle-outline'
    };

    if (property) {
      return statusDisplay[property];
    }

    return statusDisplay;
  }
}