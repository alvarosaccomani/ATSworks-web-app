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
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('session');

      if (stored) {
        try {
          const perms = JSON.parse(stored);

          if (perms.company && perms.company.roles && perms.company.roles.length > 0) {

            // 1. Mapeamos todos los roles para obtener sus arrays de rolpers
            // 2. Usamos flat() para convertir array de arrays en un solo array plano
            const allPermissionsNested = perms.company.roles.map((role: any) => role.rolpers || []);
            const flatPermissions: string[] = allPermissionsNested.flat();

            // 3. Eliminamos duplicados usando Set y convertimos de nuevo a Array
            const uniquePermissions = [...new Set(flatPermissions)];

            // 4. Seteamos la Signal con la lista completa y única
            this._permissions.set(uniquePermissions);

            console.log('Permisos cargados satisfactoriamente:', uniquePermissions);
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
