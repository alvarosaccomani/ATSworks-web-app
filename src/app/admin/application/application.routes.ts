import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { RolPermissionsComponent } from './rol-permissions/rol-permissions.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { ItemsComponent } from './items/items.component';
import { ItemComponent } from './item/item.component';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        children: [
            { path: 'rol-permissions', component: RolPermissionsComponent},
            { path: 'users', component: UsersComponent},
            { path: 'user/:usr_uuid', component: UserComponent},
            { path: 'items', component: ItemsComponent},
            { path: 'item/:itm_uuid', component: ItemComponent}
        ]
    }
];