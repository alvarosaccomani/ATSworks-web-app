import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class WorksDetailsService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public insertWorkDetail(workDetail: any): Observable<any> {
    let params = JSON.stringify(workDetail);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'work-detail', params, {headers:headers});
  }

  public updateWorkDetail(workDetail: any): Observable<any> {
    let params = JSON.stringify(workDetail);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'work-detail/' + workDetail.cmp_uuid + '/' + workDetail.wrk_uuid + '/' + workDetail.dwrk_uuid, params, {headers:headers});
  }
}
