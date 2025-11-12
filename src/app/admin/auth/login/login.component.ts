import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthenticationInterface } from '../../../core/interfaces/authentication.interface';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public user: AuthenticationInterface;
  public status: string = "";
  public identity: any = null;
  public token: any = null;
  public errorMessage: string = "";
  public showPassword: boolean = false;
  public isLoading: boolean = false; // Indica si se está procesando la solicitud

  constructor(
    private _router: Router,
    private _sessionService: SessionService,
    private _usersService: UsersService
  ) {
    this.user = {
      usr_user: '',
      usr_nick: '',
      usr_email: '',
      usr_password: '',
      usr_doNotSignOut: false
    }
  }

  ngOnInit(): void {
    this.isLoading = false;
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private validate(): boolean {
    if(!this.user.usr_user) {
      this.status = 'error';
      this.errorMessage = "El usuario no puede estar vacio";
      return false;
    }

    if(!this.user.usr_password) {
      this.status = 'error';
      this.errorMessage = "La contraseña no puede estar vacia";
      return false;
    }

    return true;
  }

  public onLogin(formLogin: NgForm): void {
    if(this.validate()) {      
      this.isLoading = true;
      this._usersService.login(formLogin.form.value).subscribe(
        response => {
          this.identity = response.data;
          if(!this.identity || !this.identity.usr_uuid) {
            this.status = 'error';
          } else {
            //persist user data
            this._sessionService.setIdentity(JSON.stringify(this.identity));
            //get token
            this.getToken();
          }
          this.isLoading = false;
        },
        error =>{
          this.isLoading = false;
          let errorMessage = <any>error;
          console.log(errorMessage);
          if(errorMessage != null) {
              this.status = 'error';
              this.errorMessage = errorMessage.error.error;
          }
        }
      )
    }
  }

  private getToken(): void {
    this._usersService.login(this.user, 'true').subscribe(
      response => {
        this.token = response.data.token;
        if(this.token.length <= 0) {
            this.status = 'error';
        } else {
            //persist user token
            this._sessionService.setToken(this.token);
            this.status = 'success';
            this._router.navigate(['/admin/user/no-company']);
        }
      },
      error =>{
        let errorMessage = <any>error;
        console.log(errorMessage);
        if(errorMessage != null) {
            this.status = 'error';
        }
      }
    )
  }

}
