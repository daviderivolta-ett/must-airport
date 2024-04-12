import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { firebaseConfig } from '../environments/environment.development';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    provideRouter(routes),
    provideAnimations(),
    provideRouter(routes, withHashLocation()),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
      HttpClient,
      HttpClientModule
    ])
  ]
};