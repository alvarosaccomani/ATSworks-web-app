import { Routes } from '@angular/router';

import { ApplicationLayoutComponent } from './application-layout/application-layout.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        component: ApplicationLayoutComponent,
        children: [
            { path: 'users', component: UsersComponent},
            { path: 'user/:usr_uuid', component: UserComponent}
        ]
    }
];