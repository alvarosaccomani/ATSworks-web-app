import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(private ngZone: NgZone) {
    if ('serviceWorker' in navigator) {
      this.checkForUpdates();
    }
  }

  private checkForUpdates(): void {
    navigator.serviceWorker.ready.then((registration) => {
      // Verificar actualizaciones periódicamente (ej: cada 5 minutos)
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // Escuchar cuando hay una nueva versión disponible
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // Cuando el nuevo SW está listo para activarse
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.ngZone.run(() => {
                this.updateAvailableSubject.next(true);
              });
            }
          });
        }
      });
    });
  }

  // Recargar la página y activar la nueva versión
  public reloadApp(): void {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        // Saltar el waiting y activar el nuevo SW
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Recargar la página
        window.location.reload();
      }
    });
  }

  // Descartar la actualización (opcional)
  public dismissUpdate(): void {
    this.updateAvailableSubject.next(false);
  }
}
