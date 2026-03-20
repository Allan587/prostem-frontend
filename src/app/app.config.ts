import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes, withComponentInputBinding()),
  provideClientHydration(withEventReplay()),
  provideHttpClient(withFetch()),
  provideFirebaseApp(() => initializeApp({
    apiKey: "AIzaSyDgmWZ_hvVeOF5k8_mDnHuUEtXVn6ypGI4",
    authDomain: "prostem-db-68733.firebaseapp.com",
    projectId: "prostem-db-68733",
    storageBucket: "prostem-db-68733.firebasestorage.app",
    messagingSenderId: "45292776459",
    appId: "1:45292776459:web:211f5b99fc5f2135e36b0e",
    measurementId: "G-ZPD0LY7X2R"
  })),
  provideAuth(() => getAuth()),
  provideStorage(() => getStorage()),
  provideFirestore(() => getFirestore()), provideCharts(withDefaultRegisterables())]
};
