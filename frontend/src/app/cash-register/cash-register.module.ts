import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashRegisterComponent } from './cash-register.component/cash-register.component';

const routes: Routes = [
  {
    path: '',
    component: CashRegisterComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CashRegisterComponent
  ]
})
export class CashRegisterModule {}