import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRolCompanyResults } from '../interfaces/user-rol-company';

@Injectable({
  providedIn: 'root'
})
export class UserRolesCompanyService {

  constructor(
    private _http: HttpClient
  ) { }

  public getUserRolesCompany(cmp_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<UserRolCompanyResults>(environment.apiUrl + 'user-roles-company/' + cmp_uuid, {headers:headers})
  }

  public getUserRolesCompanyByUser(usr_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<UserRolCompanyResults>(environment.apiUrl + 'user-roles-company-by-user/' + usr_uuid, {headers:headers})
  }

  public getUserRolesCompanyByCompanyUser(cmp_uuid: string, usr_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<UserRolCompanyResults>(environment.apiUrl + 'user-roles-company-by-company-user/' + cmp_uuid + '/' + usr_uuid, {headers:headers})
  }

  public insertUserRolCompany(userRolCompany: any): Observable<any> {
    let params = JSON.stringify(userRolCompany);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'user-rol-company', params, {headers:headers});
  }

  public deleteUserRolCompany(cmp_uuid: string, usr_uuid: string, rol_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'user-rol-company/' + cmp_uuid + '/' + usr_uuid + '/' + rol_uuid, {headers:headers});
  }
}
