import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-user',
  imports: [
    FormsModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  public user: UserInterface;
  public isLoading: boolean = false;
  public usr_password_repeat!: string;

  constructor(
    private _route: ActivatedRoute,
    private _usersService: UsersService
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

}
