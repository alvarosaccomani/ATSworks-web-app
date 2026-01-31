import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Registro del Service Worker con detección de actualizaciones
if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    console.log('Service Worker registrado con éxito:', registration);

    // Verificar si ya hay una nueva versión instalada al cargar la app
    if (registration.waiting) {
      // Emitir evento para mostrar el popup (usaremos un evento personalizado)
      document.dispatchEvent(new Event('swUpdateAvailable'));
    }

    // Escuchar cuando se instala una nueva versión en segundo plano
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          // Cuando el nuevo SW está instalado y esperando
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Emitir evento personalizado para notificar al popup
            document.dispatchEvent(new Event('swUpdateAvailable'));
          }
        });
      }
    });

    // Verificar actualizaciones periódicamente (ej: cada 5 minutos)
    setInterval(() => {
      registration.update();
    }, 5 * 60 * 1000);

  }).catch((error) => {
    console.error('Error al registrar el Service Worker:', error);
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
