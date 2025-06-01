// src/app/productos/productos.routes.ts
import { Routes } from '@angular/router';
import { ProductosListaComponent } from './lista/productos-lista.component';
import { ProductoCargarModal } from './modal/producto-cargar.modal';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: ProductosListaComponent
  },
  {
    path: 'crear',
    component: ProductoCargarModal
  },
  {
    path: 'editar/:id',
    component: ProductoCargarModal
  }
];