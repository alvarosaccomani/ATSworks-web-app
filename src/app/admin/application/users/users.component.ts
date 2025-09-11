import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { UserResults } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users',
  imports: [
    AsyncPipe,
    RouterLink,
    PageNavTabsComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  public users$!: Observable<UserResults>;

  public dataTabs: any = [
    {
      url: ['/admin/application/user', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "NUEVO USUARIO"
    },
    {
       url: ['/admin/application/users'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE USUARIOS"
    }
  ]
  
    constructor(
      private _usersService: UsersService
    ) { }
    
    ngOnInit(): void {
      this.users$ = this._usersService.getUsers('');
    }

}
