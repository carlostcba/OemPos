// src/app/orders/pipes/order-type.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

export interface TypeDisplay {
  text: string;
  icon: string;
  color: string;
  description: string;
}

@Pipe({
  name: 'orderType',
  pure: true
})
export class OrderTypePipe implements PipeTransform {

  private typeMap: { [key: string]: TypeDisplay } = {
    'orden': {
      text: 'Orden',
      icon: 'receipt-outline',
      color: 'primary',
      description: 'Compra directa en mostrador'
    },
    'pedido': {
      text: 'Pedido',
      icon: 'time-outline',
      color: 'success',
      description: 'Pedido anticipado con fecha de entrega'
    },
    'delivery': {
      text: 'Delivery',
      icon: 'car-outline',
      color: 'warning',
      description: 'Entrega a domicilio'
    },
    'salon': {
      text: 'Salón',
      icon: 'restaurant-outline',
      color: 'secondary',
      description: 'Consumo en local'
    }
  };

  transform(type: string): TypeDisplay;
  transform(type: string, property: 'text'): string;
  transform(type: string, property: 'icon'): string;
  transform(type: string, property: 'color'): string;
  transform(type: string, property: 'description'): string;
  transform(type: string, property?: keyof TypeDisplay): TypeDisplay | string {
    const typeDisplay = this.typeMap[type] || {
      text: 'Desconocido',
      icon: 'document-outline',
      color: 'medium',
      description: 'Tipo de orden no identificado'
    };

    if (property) {
      return typeDisplay[property];
    }

    return typeDisplay;
  }

  /**
   * Obtener el prefijo del código de orden según el tipo
   */
  getCodePrefix(type: string): string {
    const prefixes: { [key: string]: string } = {
      'orden': 'O',
      'pedido': 'P',
      'delivery': 'D',
      'salon': 'S'
    };

    return prefixes[type] || 'O';
  }

  /**
   * Validar si un tipo de orden es válido
   */
  isValidType(type: string): boolean {
    return Object.keys(this.typeMap).includes(type);
  }

  /**
   * Obtener todos los tipos disponibles
   */
  getAllTypes(): TypeDisplay[] {
    return Object.keys(this.typeMap).map(key => ({
      ...this.typeMap[key],
      value: key
    })) as any[];
  }
}