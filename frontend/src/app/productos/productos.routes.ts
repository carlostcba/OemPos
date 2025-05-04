// src/app/productos/productos.routes.ts
import { Routes } from '@angular/router';
import { ProductosListaComponent } from './lista/productos-lista.component';
import { ProductoFormComponent } from './formulario/producto-form.component';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: ProductosListaComponent
  },
  {
    path: 'crear',
    component: ProductoFormComponent
  },
  {
    path: 'editar/:id',
    component: ProductoFormComponent
  }
];