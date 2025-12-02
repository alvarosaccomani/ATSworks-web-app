import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppPermissionsService {

  // Usamos Signals para reactividad instantánea (Angular 16+)
  // Si usas una versión vieja, cambia esto por un BehaviorSubject
  private _permissions = signal<string[]>([]);

  constructor() { 
    this.recoverFromStorage();
  }

  /**
   * 1. RECUPERAR: Se ejecuta automáticamente al iniciar la app
   */
  private recoverFromStorage() {
    // Verificamos si estamos en el navegador (para evitar errores si usas SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('session');
      
      if (stored) {
        try {
          // Parseamos el JSON guardado
          const perms = JSON.parse(stored);
          if(perms.company.roles.length) {
            const rolpers = perms.company.roles[0].rolpers
            // Si es un array válido, lo seteamos en la Signal
            if (Array.isArray(rolpers)) {
              this._permissions.set(rolpers);
            }
          }
        } catch (e) {
          console.error('Error al leer permisos del storage:', e);
        }
      }
    }
  }

  /**
   * Verifica si tiene el permiso específico
   */
  public hasPermission(slug: string): boolean {
    // Si es SUPERADMIN, podrías retornar siempre true aquí si tienes un rol especial
    // if (this.role === 'SYSADMIN') return true; 
    
    return this._permissions().includes(slug);
  }
  
  /**
   * (Opcional) Verifica si tiene AL MENOS UNO de un array de permisos
   */
  public hasAnyPermission(slugs: string[]): boolean {
    return slugs.some(s => this._permissions().includes(s));
  }
}
