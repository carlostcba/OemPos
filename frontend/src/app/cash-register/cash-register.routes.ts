
// frontend/src/app/cash-register/cash-register.routes.ts

import { Routes } from '@angular/router';
import { CashRegisterComponent } from './cash-register.component/cash-register.component';
import { AuthGuard } from '../auth/guards/auth.guard';

export const CASH_REGISTER_ROUTES: Routes = [
  {
    path: '',
    component: CashRegisterComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'Cash Register',
      requiredPermissions: ['view_cash_register', 'process_payments']
    }
  }
];