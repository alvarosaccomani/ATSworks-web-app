import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar/nav-bar.component';
import { UserInterface } from '../../core/interfaces/user';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-customer-layout',
  imports: [
    RouterModule,
    NavBarComponent
  ],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.scss',
})
export class CustomerLayoutComponent {

  public identity!: UserInterface;

  constructor(
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.identity = this._usersService.getIdentity();
  }

}
