// frontend/src/app/pedidos/pedidos.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PEDIDOS_ROUTES } from './pedidos.routes';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(PEDIDOS_ROUTES)
  ]
})
export class PedidosModule { }