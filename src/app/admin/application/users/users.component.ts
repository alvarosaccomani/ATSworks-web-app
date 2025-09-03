import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { UserResults } from '../../../core/interfaces/user';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users',
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  public users$!: Observable<UserResults>;
  
    constructor(
      private _usersService: UsersService
    ) { }
    
    ngOnInit(): void {
      this.users$ = this._usersService.getUsers('');
    }

}
