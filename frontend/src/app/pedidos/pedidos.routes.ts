// frontend/src/app/pedidos/pedidos.routes.ts

import { Routes } from '@angular/router';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';
import { PedidosListaComponent } from './pedidos-lista/pedidos-lista.component';
import { AuthGuard } from '../auth/guards/auth.guard';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'nuevo',
    pathMatch: 'full'
  },
  {
    path: 'nuevo',
    component: NuevoPedidoComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'Nueva Orden' 
    }
  },
  {
    path: 'lista',
    component: PedidosListaComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'Lista de Órdenes' 
    }
  }
];