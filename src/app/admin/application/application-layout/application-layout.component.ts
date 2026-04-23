import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { SideBarComponent } from '../../../shared/components/side-bar/side-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { UserInterface } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';
import { SharedDataService } from '../../../core/services/shared-data.service';


@Component({
  selector: 'app-application-layout',
  imports: [
    RouterModule,
    SideBarComponent,
    NavBarComponent
],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss'
})
export class ApplicationLayoutComponent {

  public identity!: UserInterface;
  public isSidebarVisible: boolean = true;
  public isMiniMode: boolean = false;

  constructor(
    private _usersService: UsersService,
    private _sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    this.identity = this._usersService.getIdentity();

    this._sharedDataService.sidebarVisible$.subscribe(visible => {
      this.isSidebarVisible = visible;
    });

    this._sharedDataService.sidebarMini$.subscribe(mini => {
      this.isMiniMode = mini;
    });
  }


}
