import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { RolPermissionsService } from '../../../core/services/rol-permissions.service';
import { RolPermissionInterface, RolPermissionResults } from '../../../core/interfaces/rol-permission';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-rol-permissions',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './rol-permissions.component.html',
  styleUrl: './rol-permissions.component.scss'
})
export class RolPermissionsComponent {
  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  private cmp_uuid!: string;
  public rolPermissions$!: Observable<RolPermissionResults>;
  public headerConfig: any = {
    title: "LISTA DE PERMISOS DE ROLES",
    description: "Listado de Permisos de Roles.",
    icon: "fas fa-clipboard-list fa-fw"
  }
  public dataTabs: any = [
    {
      url: ['/admin/application/rol-permission', 'new', ''],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR PERMISO DE ROL"
    },
    {
       url: ['/admin/user/rolPermissions'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE PERMISOS DE ROLES"
    }
  ]

  constructor(
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _rolPermissionsService: RolPermissionsService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this.rolPermissions$ = this._rolPermissionsService.getRolPermissions("null", 1, 20);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.rolPermissions$ = this._rolPermissionsService.getRolPermissions("null", this.page, this.perPage);
      }
    });
  }

  public deleteRolPermission(rolPermission: RolPermissionInterface) {
    this._messageService.showCustomMessage({
        title: "¿Estás seguro de eliminar el Permiso de Rol?",
        type: "question",
        text: "Estás a punto de eliminar el Permiso de Rol.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._rolPermissionsService.deleteRolPermission(rolPermission.rol_uuid!, rolPermission.per_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.rolPermissions$ = this._rolPermissionsService.getRolPermissions("null", this.page, this.perPage);
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
    this.rolPermissions$ = this._rolPermissionsService.getRolPermissions("null", page, this.perPage);
  }
}
