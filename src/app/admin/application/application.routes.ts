import { Routes } from '@angular/router';

import { PermissionsComponent } from './permissions/permissions.component';
import { PermissionComponent } from './permission/permission.component';
import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { RolPermissionsComponent } from './rol-permissions/rol-permissions.component';
import { RolPermissionComponent } from './rol-permission/rol-permission.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { ItemsComponent } from './items/items.component';
import { ItemComponent } from './item/item.component';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        children: [
            { path: 'permissions', component: PermissionsComponent},
            { path: 'permission/:per_uuid', component: PermissionComponent},
            { path: 'rol-permissions', component: RolPermissionsComponent},
            { path: 'rol-permission/:rol_uuid/:per_uuid', component: RolPermissionComponent},
            { path: 'users', component: UsersComponent},
            { path: 'user/:usr_uuid', component: UserComponent},
            { path: 'items', component: ItemsComponent},
            { path: 'item/:itm_uuid', component: ItemComponent}
        ]
    }
];