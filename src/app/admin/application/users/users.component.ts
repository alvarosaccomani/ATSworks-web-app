import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { UserInterface, UserResults } from '../../../core/interfaces/user';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { UsersService } from '../../../core/services/users.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-users',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  public sysadmin!: boolean;
  public admin!: boolean;
  
  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  public users$!: Observable<UserResults>;
  public headerConfig: any = {
    title: "LISTA DE USUARIOS",
    description: "Listado de Usuarios.",
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
      private _sessionService: SessionService,
      private _messageService: MessageService,
      private _usersService: UsersService
    ) { }
    
    ngOnInit(): void {
      this.sysadmin = (this._sessionService.getCompany().roles.find((e: any) => e.rol_name === "sysadmin") != null);
      this.admin = (this._sessionService.getCompany().roles.find((e: any) => e.rol_name === "admin") != null);

      this.users$ = this._usersService.getUsers("null", this.page, this.perPage);
    }

    public deleteUser(user: UserInterface) {
      this._messageService.showCustomMessage({
          title: "¿Estás seguro de eliminar el Usuario?",
          type: "question",
          text: "Estás a punto de eliminar el Usuario.",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: "Sí, eliminar!",
          cancelButtonText: "No, cancelar"
        },
        (result: any) => {
          if (result.value) {
            this._usersService.deleteUser(user.usr_uuid!)
              .subscribe(
                response => {
                  console.info(response);
                  this.users$ = this._usersService.getUsers("null", this.page, this.perPage);
                },
                error => {
                  console.log(<any>error);
                }
              );
          }
        }
      );
    }

  public goToPage(page: number): void {
    this.page = page;
    this.users$ = this._usersService.getUsers("null", page, this.perPage);
  }
}
