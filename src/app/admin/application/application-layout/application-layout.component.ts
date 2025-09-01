import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBarComponent } from '../../../shared/components/side-bar/side-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { UserInterface } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-application-layout',
  imports: [
    CommonModule,
    RouterModule,
    SideBarComponent,
    NavBarComponent
  ],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss'
})
export class ApplicationLayoutComponent {

  public identity!: UserInterface;

  constructor(
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.identity = this._usersService.getIdentity();
  }

}
