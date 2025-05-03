import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Productos</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Lista de Productos</h2>
      <p>Lista en desarrollo...</p>
      
      <ion-list>
        <ion-item *ngFor="let i of [1,2,3,4,5]">
          <ion-label>
            <h2>Producto de ejemplo {{i}}</h2>
            <p>Descripción del producto</p>
          </ion-label>
          <ion-note slot="end" color="primary">$1000</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    h2 {
      margin-bottom: 20px;
      color: var(--ion-color-primary);
    }
  `]
})
export class ProductosListaComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}