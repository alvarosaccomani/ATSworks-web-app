import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorksDetailsService {

  constructor(
    private _http: HttpClient
  ) { }

  public insertWorkDetail(workDetail: any): Observable<any> {
    let params = JSON.stringify(workDetail);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'work-detail', params, {headers:headers});
  }

  public updateWorkDetail(workDetail: any): Observable<any> {
    let params = JSON.stringify(workDetail);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'work-detail/' + workDetail.cmp_uuid + '/' + workDetail.wrk_uuid + '/' + workDetail.dwrk_uuid, params, {headers:headers});
  }
}
