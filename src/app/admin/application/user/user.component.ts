import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { from, of } from 'rxjs';
import { mergeMap, toArray, catchError, pluck } from 'rxjs/operators';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule, NzSelectSizeType } from 'ng-zorro-antd/select';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ImageComponent } from '../../../shared/components/image/image.component';
import { UserInterface } from '../../../core/interfaces/user';
import { CompanyResults } from '../../../core/interfaces/company';
import { RolResults } from '../../../core/interfaces/rol';
import { UserRolCompanyResults } from '../../../core/interfaces/user-rol-company';
import { MessageService } from '../../../core/services/message.service';
import { UsersService } from '../../../core/services/users.service';
import { ValidationService } from '../../../core/services/validation.service';
import { CompaniesService } from '../../../core/services/companies.service';
import { RolesService } from '../../../core/services/roles.service';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';

@Component({
  selector: 'app-user',
  imports: [
    AsyncPipe,
    FormsModule,
    NzIconModule,
    NzRadioModule,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    ImageComponent
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  private cmp_uuid!: string;
  public sysadmin!: boolean;
  public admin!: boolean;
  public user!: UserInterface;
  public companies$!: Observable<CompanyResults>;
  public roles$!: Observable<RolResults>;
  public userRolesCompany$!: Observable<UserRolCompanyResults>;
  public showPasswordFields: boolean = false;
  public userRolesSelected: any;
  private userRolesSelectedSaved: any;
  public selectedCompany: any;
  public loadingCompanies: boolean = false;
  public isLoading: boolean = false;
  public usr_password_repeat!: string;
  public headerConfig: any = {};
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
    private _route: ActivatedRoute,
    private _messageService: MessageService,
    private _usersService: UsersService,
    private _validationService: ValidationService,
    private _companiesService: CompaniesService,
    private _rolesService: RolesService,
    private _userRolesCompanyService: UserRolesCompanyService
  ) {
    this.isLoading = false;
    this.userInit();
  }

  ngOnInit(): void {
    this.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    if(this.cmp_uuid) {
      this.selectedCompany = this.cmp_uuid;
      this.onChangeCompany(this.cmp_uuid);
    }
    this.sysadmin = (JSON.parse(localStorage.getItem('company')!).roles.find((e: any) => e.rol_name === "sysadmin") != null);
    this.admin = (JSON.parse(localStorage.getItem('company')!).roles.find((e: any) => e.rol_name === "admin") != null);

    this._route.params.subscribe( (params) => {
      if(params['usr_uuid'] && params['usr_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR USUARIO",
          description: "Ficha para actualizar un Usuario.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.user.usr_uuid = params['usr_uuid'];
        this.getUserById(params['usr_uuid']);
      } else {
        this.headerConfig = {
          title: "NUEVO USUARIO",
          description: "Ficha para agregar un Usuario.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
    this.companies$ = this._companiesService.getCompanies();
    this.roles$ = this._rolesService.getRoles('');
  }

  public userInit(): void {
    this.user = {
      usr_uuid: 'new',
      usr_name: null,
      usr_surname: null,
      usr_password: null,
      usr_image: null,
      usr_email: null,
      usr_nick: null,
      usr_bio: null,
      usr_registered: null,
      usr_socket: null,
      usr_online: null,
      usr_confirmed: null,
      usr_confirmationtoken: null,
      usr_resetpasswordtoken: null,
      usr_resetpasswordexpires: null,
      usr_createdat: null,
      usr_updatedat: null
    }
  }

  private getUserById(usr_uuid: string): void {
    this._usersService.getUserById(usr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.user = response.data;
          if(!this.sysadmin)
          {
            this.getUserRoles(this.cmp_uuid, usr_uuid);
          }
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

  private getUserRoles(cmp_uuid: string, usr_uuid: string): void {
    this._userRolesCompanyService.getUserRolesCompanyByCompanyUser(cmp_uuid, usr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.userRolesSelected = response.data.map((e: any) => e.rol_uuid);
          this.userRolesSelectedSaved = response.data.map((e: any) => {
              return {
                cmp_uuid: e.rol_uuid,
                rol_uuid: e.rol_uuid,
                status: 'read'
            }
          });
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

  public onImageSelected(imageSelected: any) {
    this.user.usr_image = imageSelected["base64"];
  }

  // Método para alternar la visibilidad de los campos de contraseña
  public togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    // Si se ocultan los campos, limpiar las contraseñas
    if (!this.showPasswordFields) {
      this.user.usr_password = '';
      this.usr_password_repeat = '';
    }
  }

  public onSearchCompany(value: string): void {
    this.loadingCompanies = true;
    if(value) {
      this._companiesService.getCompanies(value)
        .subscribe(data => {
          if(data) {
            this.loadingCompanies = false;
          }
        });
    }
  }

  public onChangeCompany(value: string): void {
    this.getUserRoles(value, this.user.usr_uuid!);
  }

  private manageRolesStates(newSelection: string[]) {
    // 1. Marcar roles eliminados como 'delete'
    this.userRolesSelectedSaved.forEach((role: any) => {
      if (!newSelection.includes(role.rol_uuid) && role.status !== 'delete') {
        role.status = 'delete';
      }
    });

    // 2. Agregar nuevos roles como 'insert'
    newSelection.forEach(rolUuid => {
      const existingRole = this.userRolesSelectedSaved.find(
        (role: any) => role.rol_uuid === rolUuid
      );

      if (!existingRole) {
        // Es un rol nuevo - agregar con status 'insert'
        this.userRolesSelectedSaved.push({
          rol_uuid: rolUuid,
          status: 'insert'
        });
      } else if (existingRole.status === 'delete') {
        // Si estaba marcado para eliminar pero ahora se seleccionó nuevamente
        existingRole.status = 'read'; // O 'update' según tu lógica
      }
    });
  }

  public onSelectChange(selectedRolesUuids: string[]) {
    this.manageRolesStates(selectedRolesUuids);
  }

  private validate(): boolean {
    if(!this.user.usr_nick) {
      this._messageService.error(
        "Error", 
        "El nombre de usuario no puede estar vacio."
      );
      return false;
    }

    if(!this.user.usr_email) {
      this._messageService.error(
        "Error", 
        "El e-mail puede estar vacio."
      );
      return false;
    }

    if(this.showPasswordFields && !this.user.usr_password) {
      this._messageService.error(
        "Error", 
        "La contraseña no puede estar vacia."
      );
      return false;
    }

    if(this.user.usr_nick.length > 50) {
      this._messageService.error(
        "Error", 
        "El nick del usuario no puede superar los 50 caracteres."
      );
      return false;
    }

    if(this.user.usr_email.length > 100) {
      this._messageService.error(
        "Error", 
        "El email del usuario no puede superar los 100 caracteres."
      );
      return false;
    }

    if(this.showPasswordFields && this.user.usr_password && this.user.usr_password.length > 100) {
      this._messageService.error(
        "Error", 
        "El password del usuario no puede superar los 100 caracteres."
      );
      return false;
    }

    if(!this._validationService.emailValidator(this.user.usr_email)) {
      this._messageService.error(
        "Error", 
        "El e-mail no tiene un formato correcto."
      );
      return false;
    }

    return true;
  }

  private async updateUser(formRegister: NgForm): Promise<void> {
    this.isLoading = true;
    this._usersService.updateUser(formRegister.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const user = response.data;
          this.onSaveUserRolCompany(user.usr_uuid);
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

  private async insertUser(formRegister: NgForm): Promise<void> {
    this.isLoading = true;
      this._usersService.saveUser(formRegister.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const user = response.data;
            this.onSaveUserRolCompany(user.usr_uuid);
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

  public onSaveUser(formRegister: NgForm): void {
    if(this.validate()) {
      if(this.user.usr_uuid && this.user.usr_uuid != 'new') {
        this.updateUser(formRegister);
      } else {
        this.insertUser(formRegister);
      }
    }
  }

  public onSaveUserRolCompany(usr_uuid: string): void {
    // Verificar si hay elementos en UserRolCompany
    if (this.userRolesSelectedSaved?.length) {
      this.userRolesSelectedSaved.forEach((e: any) => {
        e.cmp_uuid = this.cmp_uuid,
        e.usr_uuid = usr_uuid
      });
      // Convertir el array en un observable
      from(this.userRolesSelectedSaved)
        .pipe(
          // Procesar cada elemento del array
          mergeMap((userRolCompany: any) => {
            // Si es un nuevo registro, asignar la fecha de creación
            if (userRolCompany.usrrolcmp_createdat === null) {
              userRolCompany.usrrolcmp_createdat = new Date();
            }
  
            // Determinar si es una inserción o una actualización
            if (userRolCompany.status === 'insert') {
              // Inserción
              return this._userRolesCompanyService.insertUserRolCompany(userRolCompany).pipe(
                catchError((error) => {
                  console.error('Error al insertar:', error);
                  return of(null); // Devolver un Observable vacío en caso de error
                })
              );
            } else if(userRolCompany.status === 'delete') {
              // Actualización 
              return this._userRolesCompanyService.deleteUserRolCompany(userRolCompany.cmp_uuid, userRolCompany.usr_uuid, userRolCompany.rol_uuid).pipe(
                catchError((error) => {
                  console.error('Error al eliminar:', error);
                  return of(null); // Devolver un Observable vacío en caso de error
                })
              );
            }
            return of(null); // Devolver un Observable vacío si no hay actualización
          }),
          // Agrupar todas las respuestas en un solo array
          toArray()
        )
        .subscribe({
          next: (responses) => {
            console.log('Respuestas de las llamadas:', responses);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error al procesar las llamadas:', error);
          },
          complete: () => {
            this.isLoading = false;
            console.log('Proceso completado.');
            this._messageService.success(
              "Informacion", 
              "El Usuario fue actualizado correctamente."
            );
          }
        });
    } else {
      console.warn('No hay elementos en workDetails para procesar.');
      this.isLoading = false;
    }
  }
}
