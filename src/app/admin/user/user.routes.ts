import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent}
        ]
    }
];