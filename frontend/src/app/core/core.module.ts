// frontend/src/app/core/core.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage-angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: 'oempos_db',
      driverOrder: ['indexeddb', 'websql', 'localstorage']
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthService,
    Storage
  ],
  exports: [
    HttpClientModule,
    IonicStorageModule
  ]
})
export class CoreModule { }