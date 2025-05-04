// src/app/pedidos/pedidos.routes.ts

import { Routes } from '@angular/router';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    component: NuevoPedidoComponent
  },
  {
    path: 'nuevo',
    component: NuevoPedidoComponent
  }
];