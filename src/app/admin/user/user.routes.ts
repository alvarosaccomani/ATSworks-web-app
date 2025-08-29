import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerComponent } from './customer/customer.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent},
            { path: 'customers', component: CustomersComponent},
            { path: 'customer/:cus_uuid', component: CustomerComponent}
        ]
    }
];