import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { UserInterface } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'app-user',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  public user: UserInterface;
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;
  public usr_password_repeat!: string;

  constructor(
    private _route: ActivatedRoute,
    private _usersService: UsersService,
    private _validationService: ValidationService
  ) {
    this.isLoading = false;
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

  ngOnInit(): void {
    this._route.params.subscribe( (params) => {
      if(params['usr_uuid'] && params['usr_uuid'] != 'new') {
        this.user.usr_uuid = params['usr_uuid'];
        this.getUserById(params['usr_uuid']);
      }
    });
  }

  private getUserById(usr_uuid: string): void {
    this._usersService.getUserById(usr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.user = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private validate(): boolean {
    if(!this.user.usr_nick) {
      this.status = 'error';
      this.errorMessage = "El nombre de usuario no puede estar vacio";
      return false;
    }

    if(!this.user.usr_email) {
      this.status = 'error';
      this.errorMessage = "El e-mail puede estar vacio";
      return false;
    }

    if(!this.user.usr_password) {
      this.status = 'error';
      this.errorMessage = "La contraseña no puede estar vacia";
      return false;
    }

    if(!this._validationService.emailValidator(this.user.usr_email)) {
      this.status = 'error';
      this.errorMessage = "El e-mail no tiene un formato correcto";
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
          this.status = 'success';
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private async insertUser(formRegister: NgForm): Promise<void> {
    this.isLoading = true;
      this._usersService.saveUser(formRegister.form.value).subscribe(
        response => {
          this.isLoading = false;
          const user = response.user;
          this.status = 'success';
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage!=null) {
                this.status = 'error';
                this.errorMessage = errorMessage.error.error;
            }
        }
      )
  }

  public onSaveUser(formRegister: NgForm): void {
    if(this.validate()) {
      if(this.user.usr_uuid) {
        this.updateUser(formRegister);
      } else {
        this.insertUser(formRegister);
      }
    }
  }

}
