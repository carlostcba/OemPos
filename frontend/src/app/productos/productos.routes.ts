import { Routes } from '@angular/router';

// Usamos una versión simplificada para que no dependa de componentes inexistentes
export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./productos.module').then(m => m.ProductosModule)
  }
];