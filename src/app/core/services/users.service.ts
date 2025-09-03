import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { UserResults } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public identity: any;

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public login(user: any, gettoken: string | null = null): Observable<any> {
    if(gettoken != null) {
      user.gettoken = gettoken;
    }

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'login', params, {headers:headers});
  }

  public getIdentity()  {
    let identity = JSON.parse(localStorage.getItem('identity')!);

    if(identity !== 'undefined') {
        this.identity = identity;
    } else {
        this.identity = null;
    }
    return this.identity;
  }
  
  public getUsers(filter: string, page?: number, perPage?: number): Observable<UserResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<UserResults>(this._GlobalService.url + 'user/' + filter, {headers:headers})
  }

  public getUserById(usr_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(this._GlobalService.url + 'user/' + usr_uuid, {headers:headers});
  }

  public saveUser(user: any): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'register', params, {headers:headers});
  }
}
