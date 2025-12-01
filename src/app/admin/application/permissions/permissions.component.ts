import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { PermissionsService } from '../../../core/services/permissions.service';
import { PermissionInterface, PermissionResults } from '../../../core/interfaces/permission';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-permissions',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  //Pagination
    public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
    public perPage: number = 10; //Number of items displayed per page
    public numElements!: number; //Total existing items
  
    private cmp_uuid!: string;
    public permissions$!: Observable<PermissionResults>;
    public headerConfig: any = {
      title: "LISTA DE PERMISOS",
      description: "Listado de Permisos.",
      icon: "fas fa-clipboard-list fa-fw"
    }
    public dataTabs: any = [
      {
        url: ['/admin/application/permission', 'new'],
        icon: "fas fa-plus fa-fw",
        title: "AGREGAR PERMISO"
      },
      {
         url: ['/admin/application/permissions'],
         icon: "fas fa-clipboard-list fa-fw",
         title: "LISTA DE PERMISOS"
      }
    ]
  
    constructor(
      private _sessionService: SessionService,
      private _messageService: MessageService,
      private _permissionsService: PermissionsService,
      private _sharedDataService: SharedDataService
    ) { }
    
    ngOnInit(): void {
      this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
  
      this.permissions$ = this._permissionsService.getPermissions("null", 1, 20);
      this._sharedDataService.selectedCompany$.subscribe((company) => {
        if (company) {
          console.info(company);
          this.permissions$ = this._permissionsService.getPermissions("null", this.page, this.perPage);
        }
      });
    }
  
    public deletePermission(permission: PermissionInterface) {
      this._messageService.showCustomMessage({
          title: "¿Estás seguro de eliminar el Permiso?",
          type: "question",
          text: "Estás a punto de eliminar el Permiso.",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: "Sí, eliminar!",
          cancelButtonText: "No, cancelar"
        },
        (result: any) => {
          if (result.value) {
            this._permissionsService.deletePermission(permission.per_uuid!)
              .subscribe(
                response => {
                  console.info(response);
                  this.permissions$ = this._permissionsService.getPermissions("null", this.page, this.perPage);
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
      this.permissions$ = this._permissionsService.getPermissions("null", page, this.perPage);
    }
}
