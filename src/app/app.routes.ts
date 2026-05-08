import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    { 
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    { 
        path: 'customer',
        canActivate: [roleGuard],
        data: { role: 'cliente' },
        loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
    },
    { path: '**', redirectTo: 'auth/login'}
];
