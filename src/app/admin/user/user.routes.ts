import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { NoCompanyComponent } from './no-company/no-company.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerComponent } from './customer/customer.component';
import { AddressComponent } from './address/address.component';
import { ModelsItemsComponent } from './models-items/models-items.component';
import { ModelItemComponent } from './model-item/model-item.component';
import { WorksComponent } from './works/works.component';
import { WorkComponent } from './work/work.component';
import { WorkSheetComponent } from './work-sheet/work-sheet.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'no-company', component: NoCompanyComponent},
            { path: 'dashboard', component: DashboardComponent },
            { path: 'customers', component: CustomersComponent },
            { path: 'customer/:cus_uuid', component: CustomerComponent },
            { path: 'address/:cus_uuid/:adr_uuid', component: AddressComponent },
            { path: 'models-items', component: ModelsItemsComponent },
            { path: 'model-item/:itm_uuid/:cmpitm_uuid/:mitm_uuid', component: ModelItemComponent },
            { path: 'works', component: WorksComponent },
            { path: 'work/:wrk_uuid', component: WorkComponent },
            { path: 'work-sheet/:wrk_uuid', component: WorkSheetComponent },
            { path: 'company-profile/:cmp_uuid', component: CompanyProfileComponent }
        ]
    }
];