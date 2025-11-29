import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { RolPermissionInterface } from '../../../core/interfaces/rol-permission';
import { RolInterface } from '../../../core/interfaces/rol';
import { PermissionInterface } from '../../../core/interfaces/permission/permission.interface';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { RolPermissionsService } from '../../../core/services/rol-permissions.service';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionsService } from '../../../core/services/permissions.service';

@Component({
  selector: 'app-rol-permission',
  imports: [
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './rol-permission.component.html',
  styleUrl: './rol-permission.component.scss'
})
export class RolPermissionComponent {

  public rolPermission!: RolPermissionInterface;
  private rolPermissionUpdate: any;
  public roles: RolInterface[] = [];
  public permissions: PermissionInterface[] = [];
  public isLoading: boolean = false;
  public headerConfig: any = {};
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
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _rolPermissionsService: RolPermissionsService,
    private _rolesService: RolesService,
    private _permissionsService: PermissionsService
  ) {
    this.isLoading = false;
    this.rolPermissionInit();
  }

  ngOnInit(): void {
    this.getRoles();
    this.getPermissions();

    this._route.params.subscribe( (params) => {
      if(params['rol_uuid'] && params['rol_uuid'] != 'new' && params['per_uuid'] && params['per_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR PERMISO DE ROL",
          description: "Ficha para actualizar un Permiso de Rol.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.rolPermission.rol_uuid = params['rol_uuid'];
        this.rolPermission.per_uuid = params['per_uuid'];
        this.rolPermissionUpdate = {
          rol_uuid: params['rol_uuid'],
          per_uuid: params['per_uuid']
        }
        this.getRolPermissionById(this.rolPermission.rol_uuid!, this.rolPermission.per_uuid!)
      } else {
        this.headerConfig = {
          title: "AGREGAR PERMISO DE ROL",
          description: "Ficha para agregar un Permiso de Rol.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
  }

  public rolPermissionInit(): void {
    this.rolPermission = {
      rol_uuid: 'new',
      rol: null,
      per_uuid: null,
      per: null,
      rolper_createdat: null,
      rolper_updatedat: null
    }
  }
  
  private getRoles() {
    this._rolesService.getRoles().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.roles = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getPermissions() {
    this._permissionsService.getPermissions().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.permissions = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private getRolPermissionById(cmp_uuid: string, cus_uuid: string): void {
    this._rolPermissionsService.getRolPermissionById(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.rolPermission = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public onRolChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedRol = this.roles.find(
      (selectedRol: RolInterface) => selectedRol.rol_uuid === selectedValue
    );
    if (selectedRol) {
      //this.setModelItem(selectedRol);
    }
  }

  public onPermissionChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedPermission = this.permissions.find(
      (selectedPermission: PermissionInterface) => selectedPermission.per_uuid === selectedValue
    );
    if (selectedPermission) {
      //this.setModelItem(selectedRol);
    }
  }

  private validate(): boolean {
    if(!this.rolPermission.rol_uuid) {
      this._messageService.error(
        "Error", 
        "El rol no puede estar vacio."
      );
      return false;
    }

    if(!this.rolPermission.per_uuid) {
      this._messageService.error(
        "Error", 
        "El permiso no puede estar vacio."
      );
      return false;
    }

    return true;
  }

  private async updateRolPermission(formRolPermission: NgForm): Promise<void> {
    this.isLoading = true;
    this._rolPermissionsService.deleteRolPermission(this.rolPermissionUpdate.rol_uuid, this.rolPermissionUpdate.per_uuid).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const rolPermission = response.data;
          this.insertRolPermission(formRolPermission);
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private async insertRolPermission(formRolPermission: NgForm): Promise<void> {
    this.isLoading = true;
      this._rolPermissionsService.saveRolPermission(formRolPermission.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const rolPermission = response.data;
            let message = "";
            if(!rolPermission.rolper_createdat) {
              message = "El Permiso de Rol fue agregado correctamente."
            } else {
              message = "El Permiso de Rol fue editado correctamente."
            }
            this._messageService.success(
              "Informacion", 
              message,
              () => {
                this._router.navigate(['/admin/application/rol-permissions']);
              }
            );
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage != null) {
              this._messageService.error(
                "Error", 
                errorMessage.error.error
              );
            }
        }
      )
  }

  public onSaveRolPermission(formRolPermission: NgForm): void {
    if(this.validate()) {
      if(this.rolPermission.rolper_createdat) {
        this.updateRolPermission(formRolPermission);
      } else {
        this.insertRolPermission(formRolPermission);
      }
    }
  }
}
