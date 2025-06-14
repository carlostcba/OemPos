// frontend/src/app/cash-register/cash-register.module.ts

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CASH_REGISTER_ROUTES } from './cash-register.routes';
import { CashRegisterComponent } from './cash-register.component/cash-register.component';

@NgModule({
  imports: [
    RouterModule.forChild(CASH_REGISTER_ROUTES),
    CashRegisterComponent
  ]
})
export class CashRegisterModule {}