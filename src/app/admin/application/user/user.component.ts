import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule, NzSelectSizeType } from 'ng-zorro-antd/select';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ImageComponent } from '../../../shared/components/image/image.component';
import { UserInterface } from '../../../core/interfaces/user';
import { RolResults } from '../../../core/interfaces/rol';
import { UserRolCompanyResults } from '../../../core/interfaces/user-rol-company';
import { MessageService } from '../../../core/services/message.service';
import { UsersService } from '../../../core/services/users.service';
import { ValidationService } from '../../../core/services/validation.service';
import { RolesService } from '../../../core/services/roles.service';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';

@Component({
  selector: 'app-user',
  imports: [
    AsyncPipe,
    FormsModule,
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

  public user!: UserInterface;
  public roles$!: Observable<RolResults>;
  public userRolesCompany$!: Observable<UserRolCompanyResults>;
  public userRolesSelected: any;
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
    private _rolesService: RolesService,
    private _userRolesCompanyService: UserRolesCompanyService
  ) {
    this.isLoading = false;
    this.userInit();
  }

  ngOnInit(): void {
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
          this.getUserRoles(usr_uuid);
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

  private getUserRoles(usr_uuid: string): void {
    this._userRolesCompanyService.getUserRolesCompanyByUser(usr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.userRolesSelected = response.data.map((e: any) => e.rol_uuid);
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

    if(!this.user.usr_password) {
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

    if(this.user.usr_password.length > 100) {
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
          const user = response.user;
          this._messageService.success(
            "Informacion", 
            "El Usuario fue actualizado correctamente."
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

  private async insertUser(formRegister: NgForm): Promise<void> {
    this.isLoading = true;
      this._usersService.saveUser(formRegister.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const user = response.user;
            this._messageService.success(
              "Informacion", 
              "El Usuario fue agregado correctamente."
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

  public onSaveUser(formRegister: NgForm): void {
    if(this.validate()) {
      if(this.user.usr_uuid && this.user.usr_uuid != 'new') {
        this.updateUser(formRegister);
      } else {
        this.insertUser(formRegister);
      }
    }
  }
}
