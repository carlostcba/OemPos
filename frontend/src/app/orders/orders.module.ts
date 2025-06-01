// src/app/orders/orders.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

// Componentes Standalone
import { OrderDetailsComponent } from './details/order-details.component';
import { OrderListComponent } from './list/order-list.component';

// Modales Standalone
import { CouponModal } from './modals/coupon.modal';
import { OrderSummaryModal } from './modals/order-summary.modal';

// Pipes Standalone
import { OrderStatusPipe } from './pipes/order-status.pipe';
import { OrderTypePipe } from './pipes/order-type.pipe';

// Servicios
import { OrderService } from './services/order.service';
import { OrderQueueService } from './services/order-queue.service';

// Guards
import { OrderDetailsGuard } from './guards/order-details.guard';

// Rutas
const routes: Routes = [
  {
    path: '',
    component: OrderListComponent
  },
  {
    path: 'details/:id',
    component: OrderDetailsComponent,
    canActivate: [OrderDetailsGuard]
  }
];

@NgModule({
  declarations: [
    // Solo componentes NO standalone
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),

    // Importación de componentes/pipes standalone
    OrderDetailsComponent,
    OrderListComponent,
    CouponModal,
    OrderSummaryModal,
    OrderStatusPipe,
    OrderTypePipe
  ],
  providers: [
    OrderService,
    OrderQueueService,
    OrderDetailsGuard
  ],
  exports: [
    OrderDetailsComponent,
    OrderListComponent,
    CouponModal,
    OrderSummaryModal,
    OrderStatusPipe,
    OrderTypePipe
  ]
})
export class OrdersModule { }

// === EXPORT BARREL ===
export * from './details/order-details.component';
export * from './list/order-list.component';
export * from './modals/coupon.modal';
export * from './modals/order-summary.modal';
export * from './services/order.service';
export * from './services/order-queue.service';
export * from './guards/order-details.guard';
export * from './pipes/order-status.pipe';
export * from './pipes/order-type.pipe';
