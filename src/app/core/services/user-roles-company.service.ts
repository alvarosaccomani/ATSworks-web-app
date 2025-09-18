import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { UserRolCompanyResults } from '../interfaces/user-rol-company';

@Injectable({
  providedIn: 'root'
})
export class UserRolesCompanyService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getUserRolesCompany(cmp_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<UserRolCompanyResults>(this._GlobalService.url + 'user-roles-company/' + cmp_uuid, {headers:headers})
  }

  public getUserRolesCompanyByUser(usr_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<UserRolCompanyResults>(this._GlobalService.url + 'user-roles-company-by-user/' + usr_uuid, {headers:headers})
  }
}
