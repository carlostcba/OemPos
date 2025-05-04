// src/app/shared/layouts/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MainMenuComponent } from '../../components/main-menu/main-menu.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, MainMenuComponent],
  template: `
    <app-main-menu></app-main-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  `
})
export class MainLayoutComponent {}