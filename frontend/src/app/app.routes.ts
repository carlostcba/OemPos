import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'productos',
    loadChildren: () => import('./productos/productos.routes').then(m => m.PRODUCTOS_ROUTES),
    canActivate: [AuthGuard]
  },
  // Otras rutas...
];