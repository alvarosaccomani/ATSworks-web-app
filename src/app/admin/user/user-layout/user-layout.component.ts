import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBarComponent } from '../../../shared/components/side-bar/side-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-user-layout',
  imports: [
    CommonModule,
    RouterModule,
    SideBarComponent,
    NavBarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

  public identity!: UserInterface;

  constructor(
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.identity = this._usersService.getIdentity();
  }

}
