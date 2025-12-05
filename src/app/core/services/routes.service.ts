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
}
