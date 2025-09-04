import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerComponent } from './customer/customer.component';
import { ModelsItemsComponent } from './models-items/models-items.component';
import { ModelItemComponent } from './model-item/model-item.component';
import { WorksComponent } from './works/works.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'customers', component: CustomersComponent },
            { path: 'customer/:cus_uuid', component: CustomerComponent },
            { path: 'models-items', component: ModelsItemsComponent },
            { path: 'model-item/:itm_uuid/:cmpitm_uuid/:mitm_uuid', component: ModelItemComponent },
            { path: 'works', component: WorksComponent },
            { path: 'company-profile/:cmp_uuid', component: CompanyProfileComponent }
        ]
    }
];