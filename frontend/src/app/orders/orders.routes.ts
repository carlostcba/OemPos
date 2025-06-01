// src/app/orders/orders.routes.ts
import { Routes } from '@angular/router';
import { OrderListComponent } from './list/order-list.component';
import { NewOrderComponent } from './new/new-order.component';
import { OrderQueueComponent } from './queue/order-queue.component';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: OrderListComponent,
    data: {
      title: 'Lista de Órdenes',
      requiresAuth: true,
      roles: ['seller', 'cashier', 'admin']
    }
  },
  {
    path: 'new',
    component: NewOrderComponent,
    data: {
      title: 'Nueva Orden',
      requiresAuth: true,
      roles: ['seller', 'admin']
    }
  },
  {
    path: 'queue',
    component: OrderQueueComponent,
    data: {
      title: 'Cola de Atención',
      requiresAuth: true,
      roles: ['cashier', 'admin']
    }
  },
  {
    path: ':id',
    component: OrderListComponent,
    data: {
      title: 'Detalles de Orden',
      requiresAuth: true,
      roles: ['seller', 'cashier', 'admin']
    }
  }
];

// Alternativa usando lazy loading (recomendado para mejor rendimiento)
export const ORDERS_ROUTES_LAZY: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/order-list.component').then(m => m.OrderListComponent),
    data: {
      title: 'Lista de Órdenes',
      requiresAuth: true,
      roles: ['seller', 'cashier', 'admin']
    }
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new-order.component').then(m => m.NewOrderComponent),
    data: {
      title: 'Nueva Orden',
      requiresAuth: true,
      roles: ['seller', 'admin']
    }
  },
  {
    path: 'queue',
    loadComponent: () => import('./queue/order-queue.component').then(m => m.OrderQueueComponent),
    data: {
      title: 'Cola de Atención',
      requiresAuth: true,
      roles: ['cashier', 'admin']
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./list/order-list.component').then(m => m.OrderListComponent),
    data: {
      title: 'Detalles de Orden',
      requiresAuth: true,
      roles: ['seller', 'cashier', 'admin']
    }
  }
];

// Para usar en app-routing.module.ts
export const APP_ORDERS_ROUTE = {
  path: 'orders',
  loadChildren: () => import('./orders.module').then(m => m.OrdersModule),
  data: {
    preload: true,
    title: 'Órdenes'
  }
};

// Rutas para integrar en el routing principal si usas standalone components
export const APP_ORDERS_STANDALONE_ROUTES: Routes = [
  {
    path: 'orders',
    children: ORDERS_ROUTES_LAZY
  }
];