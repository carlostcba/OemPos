// frontend/src/app/inventory/inventory.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component/inventory.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    InventoryComponent
  ]
})
export class InventoryModule {}
