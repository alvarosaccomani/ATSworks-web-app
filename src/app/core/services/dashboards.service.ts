import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { DashboardResults  } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getDashboards(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<DashboardResults> {
      let headers = new HttpHeaders().set('content-type','application/json');
  
      if(page && perPage) {
        filter = `${filter}/${page}/${perPage}`;
      }
  
      return this._http.get<DashboardResults>(this._GlobalService.url + 'dashboards/' + cmp_uuid + '/' + filter, {headers:headers})
    }
}
