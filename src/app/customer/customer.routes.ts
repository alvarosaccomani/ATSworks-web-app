import { Routes } from '@angular/router';

import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { CustomerWorksComponent } from './customer-works/customer-works.component';
import { UserComponent } from './user/user.component';

export const CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        component: CustomerLayoutComponent,
        children: [
            { path: 'customer-works', component: CustomerWorksComponent },
            { path: 'user', component: UserComponent },
        ]
    }
];