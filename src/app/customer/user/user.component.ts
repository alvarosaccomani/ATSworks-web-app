import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SessionService } from '../../core/services/session.service';
import { UsersService } from '../../core/services/users.service';
import { MessageService } from '../../core/services/message.service';
import { ValidationService } from '../../core/services/validation.service';
import { UserInterface } from '../../core/interfaces/user';
import { ImageComponent } from '../../shared/components/image/image.component';

@Component({
  selector: 'app-user',
  imports: [
    FormsModule,
    ImageComponent
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {

  public user: UserInterface;
  public isLoading: boolean = false;
  public showPasswordFields: boolean = false;
  public usr_password_repeat: string = '';
  public identity: any;

  constructor(
    private _sessionService: SessionService,
    private _usersService: UsersService,
    private _messageService: MessageService,
    private _validationService: ValidationService
  ) {
    this.user = {
      usr_uuid: '',
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
      usr_sysadmin: null,
      usr_createdat: null,
      usr_updatedat: null
    };
  }

  ngOnInit(): void {
    this.identity = this._sessionService.getIdentity();
    if (this.identity && this.identity.usr_uuid) {
      this.getUserById(this.identity.usr_uuid);
    }
  }

  private getUserById(usr_uuid: string): void {
    this.isLoading = true;
    this._usersService.getUserById(usr_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          this.user = response.data;
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error fetching user data:', error);
        this.isLoading = false;
      }
    );
  }

  public onImageSelected(imageSelected: any) {
    this.user.usr_image = imageSelected["base64"];
  }

  public togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.user.usr_password = '';
      this.usr_password_repeat = '';
    }
  }

  private validate(): boolean {
    if (!this.user.usr_nick) {
      this._messageService.error("Error", "El nombre de usuario no puede estar vacío.");
      return false;
    }
    if (!this.user.usr_email) {
      this._messageService.error("Error", "El e-mail no puede estar vacío.");
      return false;
    }
    if (this.showPasswordFields) {
      if (!this.user.usr_password) {
        this._messageService.error("Error", "La contraseña no puede estar vacía.");
        return false;
      }
      if (this.user.usr_password !== this.usr_password_repeat) {
        this._messageService.error("Error", "Las contraseñas no coinciden.");
        return false;
      }
    }
    if (!this._validationService.emailValidator(this.user.usr_email)) {
      this._messageService.error("Error", "El e-mail no tiene un formato correcto.");
      return false;
    }
    return true;
  }

  public onSaveUser(formRegister: NgForm): void {
    if (this.validate()) {
      this.isLoading = true;
      const userData = { ...this.user };
      
      // Si no se están editando los campos de contraseña, los quitamos del envío
      if (!this.showPasswordFields) {
        delete (userData as any).usr_password;
      }

      this._usersService.updateUser(userData).subscribe(
        response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success("Información", "Tu perfil ha sido actualizado correctamente.");
            // Actualizar la identidad en la sesión
            this._sessionService.setIdentity(JSON.stringify(response.data));
          }
        },
        error => {
          this.isLoading = false;
          let errorMessage = error?.error?.error || "Ocurrió un error al actualizar el perfil.";
          this._messageService.error("Error", errorMessage);
        }
      );
    }
  }
}
