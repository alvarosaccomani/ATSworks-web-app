import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RolPermissionResults } from '../interfaces/rol-permission/rol-permission-results.interface';

@Injectable({
  providedIn: 'root'
})
export class RolPermissionsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getRolPermissions(filter: string, page?: number, perPage?: number): Observable<RolPermissionResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<RolPermissionResults>(environment.apiUrl + 'rol-permissions/' + filter, {headers:headers})
  }

  public getRolPermissionById(rol_uuid: string, per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'rol-permission/' + rol_uuid + '/' + per_uuid, {headers:headers});
  }

  public saveRolPermission(rolPermission: any): Observable<any> {
    let params = JSON.stringify(rolPermission);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'rol-permission', params, {headers:headers});
  }

  public deleteRolPermission(rol_uuid: string, per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'rol-permission/' + rol_uuid + '/' + per_uuid, {headers:headers});
  }
}
