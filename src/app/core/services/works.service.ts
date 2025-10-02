import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { WorkResults } from '../interfaces/work';

@Injectable({
  providedIn: 'root'
})
export class WorksService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getWorks(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<WorkResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<WorkResults>(this._GlobalService.url + 'works/' + cmp_uuid + '/' + filter, {headers:headers})
  }

  public getWorkById(cmp_uuid: string, wrk_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(this._GlobalService.url + 'work/' + cmp_uuid + '/' + wrk_uuid, {headers:headers});
  }

  public saveWork(work: any): Observable<any> {
    let params = JSON.stringify(work);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'work', params, {headers:headers});
  }

  public updateWork(work: any): Observable<any> {
    let params = JSON.stringify(work);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'work/' + work.cmp_uuid + '/' + work.wrk_uuid, params, {headers:headers});
  }

  public deleteWork(cmp_uuid: string, wrk_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(this._GlobalService.url + 'work/' + cmp_uuid + '/' + wrk_uuid, {headers:headers});
  }
}
