import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { PermissionInterface } from '../../../core/interfaces/permission';
import { ResourceTypeInterface } from '../../../core/interfaces/resource-type';
import { ResourceModuleInterface } from '../../../core/interfaces/resource-module';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { ResourcesTypesService } from '../../../core/services/resources-types.service';
import { ResourcesModulesService } from '../../../core/services/resources-modules.service';

@Component({
  selector: 'app-permission',
  imports: [
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent {

  public permission!: PermissionInterface;
  public resourcesTypes: ResourceTypeInterface[] = [];
  public resourcesModules: ResourceModuleInterface[] = [];
  public isLoading: boolean = false;
  public headerConfig: any = {};
  public dataTabs: any = [
    {
      url: ['/admin/application/permission', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR PERMISO"
    },
    {
        url: ['/admin/user/permissions'],
        icon: "fas fa-clipboard-list fa-fw",
        title: "LISTA DE PERMISOS"
    }
  ]
  
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _permissionsService: PermissionsService,
    private _resourcesTypesService: ResourcesTypesService,
    private _resourcesModulesService: ResourcesModulesService
  ) {
    this.isLoading = false;
    this.permissionInit();
  }

  ngOnInit(): void {
    this.getResourcesTypes();
    this.getResourcesModules();

    this._route.params.subscribe( (params) => {
      if(params['per_uuid'] && params['per_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR PERMISO",
          description: "Ficha para actualizar un Permiso.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.permission.per_uuid = params['per_uuid'];
        this.getPermissionById(this.permission.per_uuid!)
      } else {
        this.headerConfig = {
          title: "AGREGAR PERMISO",
          description: "Ficha para agregar un Permiso.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
  }

  public permissionInit(): void {
    this.permission = {
      per_uuid: 'new',
      per_slug: null,
      per_description: null,
      rety_uuid: null,
      rety: null,
      remo_uuid: null,   
      remo: null,
      per_createdat: null,
      per_updatedat: null
    }
  }
  
  private getResourcesTypes() {
    this._resourcesTypesService.getResourcesTypes().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.resourcesTypes = response.data;
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

  private getResourcesModules() {
    this._resourcesModulesService.getResourcesModules().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.resourcesModules = response.data;
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

  private getPermissionById(per_uuid: string): void {
    this._permissionsService.getPermissionById(per_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.permission = response.data;
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
  
  public onResourceTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedResourceType = this.resourcesTypes.find(
      (selectedResourceType: ResourceTypeInterface) => selectedResourceType.rety_uuid === selectedValue
    );
    if (selectedResourceType) {
      //this.setModelItem(selectedResourceType);
    }
  }

  public onResourceModuleChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedResourceModule = this.resourcesModules.find(
      (selectedResourceModule: ResourceModuleInterface) => selectedResourceModule.remo_uuid === selectedValue
    );
    if (selectedResourceModule) {
      //this.setModelItem(selectedResourceModule);
    }
  }

  private validate(): boolean {
    if(!this.permission.per_slug) {
      this._messageService.error(
        "Error", 
        "El slug no puede estar vacio."
      );
      return false;
    }

    if(!this.permission.rety_uuid) {
      this._messageService.error(
        "Error", 
        "El tipo de recurso no puede estar vacio."
      );
      return false;
    }

    if(!this.permission.remo_uuid) {
      this._messageService.error(
        "Error", 
        "El tipo de modulo no puede estar vacio."
      );
      return false;
    }

    return true;
  }

  private async updatePermission(formPermission: NgForm): Promise<void> {
    this.isLoading = true;
    this._permissionsService.updatePermission(formPermission.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const permission = response.data;
          this._messageService.success(
            "Informacion", 
            "El Permiso fue actualizado correctamente.",
            () => {
              this._router.navigate(['/admin/application/permissions']);
            }
          );
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
          this._messageService.error(
            "Error", 
            errorMessage.error.error
          );
        }
      }
    )
  }

  private async insertPermission(formPermission: NgForm): Promise<void> {
    this.isLoading = true;
    this._permissionsService.savePermission(formPermission.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const permission = response.data;
          this._messageService.success(
            "Informacion", 
            "El Permiso fue agregado correctamente.",
            () => {
              this._router.navigate(['/admin/application/items']);
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

  public onSavePermission(formPermission: NgForm): void {
    if(this.validate()) {
      if(this.permission.per_createdat) {
        this.updatePermission(formPermission);
      } else {
        this.insertPermission(formPermission);
      }
    }
  }
}
