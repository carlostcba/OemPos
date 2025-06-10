// frontend/src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './app/core/interceptors/token.interceptor';

// ✅ Importar locale argentino
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsAr from '@angular/common/locales/es-AR';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// ✅ Registrar locales
registerLocaleData(localeEs);
registerLocaleData(localeEsAr, 'es-AR');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    // ✅ Configurar locale argentino como default
    { provide: LOCALE_ID, useValue: 'es-AR' },
    importProvidersFrom(IonicStorageModule.forRoot())
  ]
});