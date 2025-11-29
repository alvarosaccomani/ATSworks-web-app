import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionResults } from '../interfaces/permission/permission-results.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getPermissions(filter?: string, page?: number, perPage?: number): Observable<PermissionResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<PermissionResults>(environment.apiUrl + 'permissions/' + filter, {headers:headers})
  }

  public getPermissionById(per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'permission/' + per_uuid, {headers:headers});
  }

  public savePermission(permission: any): Observable<any> {
    let params = JSON.stringify(permission);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'permission', params, {headers:headers});
  }

  public updatePermission(permission: any): Observable<any> {
    let params = JSON.stringify(permission);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'permission/' + permission.per_uuid, params, {headers:headers});
  }

  public deletePermission(per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'permission/' + per_uuid, {headers:headers});
  }
}
