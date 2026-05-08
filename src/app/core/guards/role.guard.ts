import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  
  // Obtenemos el rol requerido de la data de la ruta
  const requiredRole = route.data['role']; // 'admin' o 'cliente'
  
  // 1. Verificamos si el usuario está autenticado (tiene token)
  const token = sessionService.getToken();
  if (!token) {
    return router.parseUrl('/auth/login');
  }

  // 2. Si va a "no-company", permitimos el paso si está logueado
  if (state.url.includes('no-company')) {
    return true;
  }

  // 3. Obtenemos la empresa actual y sus roles
  const currentCompany = sessionService.getCompany();
  
  // 4. Si no hay empresa seleccionada, lo mandamos a elegir una (no-company)
  if (!currentCompany) {
    return router.parseUrl('/admin/user/no-company');
  }

  const userRoles = currentCompany.roles?.map((r: any) => r.rol_name.toLowerCase()) || [];

  // 5. Verificamos si el usuario tiene el rol necesario
  const hasAccess = userRoles.some((role: string) => role.includes(requiredRole));

  if (hasAccess) {
    return true;
  }

  // Redirección lógica si no tiene acceso pero tiene otros roles
  if (requiredRole === 'admin' && userRoles.some((role: string) => role.includes('cliente'))) {
    return router.parseUrl('/customer/customer-works');
  }

  if (requiredRole === 'cliente' && userRoles.some((role: string) => !role.includes('cliente'))) {
    return router.parseUrl('/admin/user/dashboard');
  }

  // Por defecto, si no tiene el rol para esta sección, al login (o podrías mandarlo a un "unauthorized")
  return router.parseUrl('/auth/login');
};
