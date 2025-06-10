// frontend/src/app/shared/pipes/ars-currency.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'arsCurrency',
  standalone: true
})
export class ArsCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | string | null): string | null {
    return this.currencyPipe.transform(value, 'ARS', 'symbol', '1.2-2', 'es-AR');
  }
}

// ✅ Provider para usar en componentes standalone
export const ARS_CURRENCY_PROVIDERS = [CurrencyPipe];