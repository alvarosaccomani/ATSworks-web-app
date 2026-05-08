import { Routes } from '@angular/router';

import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { CustomerWorksComponent } from './customer-works/customer-works.component';

export const CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        component: CustomerLayoutComponent,
        children: [
            { path: 'customer-works', component: CustomerWorksComponent }
        ]
    }
];