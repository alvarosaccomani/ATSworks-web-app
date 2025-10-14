import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResults } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public identity: any;

  constructor(
    private _http: HttpClient
  ) { }

  public login(user: any, gettoken: string | null = null): Observable<any> {
    if(gettoken != null) {
      user.gettoken = gettoken;
    }

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'login', params, {headers:headers});
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

    return this._http.get<UserResults>(environment.apiUrl + 'user/' + filter, {headers:headers})
  }

  public getUserById(usr_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'user/' + usr_uuid, {headers:headers});
  }

  public saveUser(user: any): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'register', params, {headers:headers});
  }

  public updateUser(user: any): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'user/' + user.usr_uuid, params, {headers:headers});
  }

  public deleteUser(usr_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'user/' + usr_uuid, {headers:headers});
  }
}
