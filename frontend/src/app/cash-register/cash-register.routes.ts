// src/app/cash-register/cash-register.routes.ts
import { Routes } from '@angular/router';
import { CashRegisterComponent } from './cash-register.component/cash-register.component';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: CashRegisterComponent
  }
];
