// frontend/src/app/productos/productos.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProductosListaComponent } from './lista/productos-lista.component';

const routes: Routes = [
  {
    path: '',
    component: ProductosListaComponent
  },
  {
    path: 'lista',
    component: ProductosListaComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductosModule { }