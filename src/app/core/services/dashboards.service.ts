import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResults  } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getDashboards(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<DashboardResults> {
      let headers = new HttpHeaders().set('content-type','application/json');
  
      if(page && perPage) {
        filter = `${filter}/${page}/${perPage}`;
      }
  
      return this._http.get<DashboardResults>(environment.apiUrl + 'dashboards/' + cmp_uuid + '/' + filter, {headers:headers})
    }
}
