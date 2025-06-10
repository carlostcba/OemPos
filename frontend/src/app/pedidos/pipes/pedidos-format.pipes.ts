// frontend/src/app/pedidos/pipes/pedidos-format.pipes.ts

import { Pipe, PipeTransform } from '@angular/core';

// ===== PIPE PARA TIPOS DE PEDIDO =====
@Pipe({
  name: 'pedidoType',
  standalone: true
})
export class PedidoTypePipe implements PipeTransform {
  transform(type: string): string {
    const types: { [key: string]: string } = {
      'orden': 'Orden',
      'pedido': 'Pedido',
      'delivery': 'Delivery',
      'salon': 'Salón'
    };
    
    return types[type] || type;
  }
}

// ===== PIPE PARA ESTADOS DE PEDIDO =====
@Pipe({
  name: 'pedidoStatus',
  standalone: true
})
export class PedidoStatusPipe implements PipeTransform {
  transform(status: string): string {
    const statuses: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'esperando_retiro': 'Esperando Retiro',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    
    return statuses[status] || status;
  }
}

// ===== PIPE PARA FORMATEAR FECHA RELATIVA =====
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}

// ✅ REMOVIDO: CurrencyPipe (usar el nativo de Angular)