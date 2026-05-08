import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  
  // Obtenemos el rol requerido de la data de la ruta
  const requiredRole = route.data['role']; // 'admin' o 'cliente'
  
  // Obtenemos los roles del usuario en la empresa actual
  const currentCompany = sessionService.getCompany();
  const userRoles = currentCompany?.roles?.map((r: any) => r.rol_name.toLowerCase()) || [];

  // Verificamos si el usuario tiene el rol necesario
  const hasAccess = userRoles.some((role: string) => role.includes(requiredRole));

  if (hasAccess) {
    return true;
  }

  // Redirección lógica si no tiene acceso
  // Si intentaba entrar a admin pero es cliente, lo mandamos a customer
  if (requiredRole === 'admin' && userRoles.some((role: string) => role.includes('cliente'))) {
    return router.parseUrl('/customer/customer-works');
  }

  // Si intentaba entrar a customer pero es admin, lo mandamos a admin
  if (requiredRole === 'cliente' && userRoles.some((role: string) => !role.includes('cliente'))) {
    return router.parseUrl('/admin/user/dashboard');
  }

  // Por defecto, al login
  return router.parseUrl('/auth/login');
};
