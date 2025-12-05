import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RouteResults } from '../interfaces/route';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getRoutes(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<RouteResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<RouteResults>(environment.apiUrl + 'routes/' + cmp_uuid + '/' + filter, {headers:headers})
  }

  public getRouteById(cmp_uuid: string, rou_uuid?: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'route/' + cmp_uuid + '/' + rou_uuid, {headers:headers});
  }

  public saveRoute(route: any): Observable<any> {
    let params = JSON.stringify(route);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'route', params, {headers:headers});
  }

  public updateRoute(route: any): Observable<any> {
    let params = JSON.stringify(route);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'route/' + route.cmp_uuid + '/' + route.rou_uuid, params, {headers:headers});
  }

  public deleteRoute(cmp_uuid: string, rol_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'route/' + cmp_uuid + '/' + rol_uuid, {headers:headers});
  }
}
