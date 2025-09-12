import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { UserResults } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  public users$!: Observable<UserResults>;
  public headerConfig: any = {
    title: "LISTA DE USUARIOS",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
    icon: "fas fa-clipboard-list fa-fw"
  }
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
