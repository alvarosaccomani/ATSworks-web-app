import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkResults } from '../interfaces/work';

@Injectable({
  providedIn: 'root'
})
export class WorksService {

  constructor(
    private _http: HttpClient
  ) { }

  public getWorks(cmp_uuid: string, wrk_dateFrom?: string, wrk_dateTo?: string, wrk_fullname?: string, page?: number, perPage?: number, field_order?: string, wrk_order?: string): Observable<WorkResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (wrk_dateFrom) {
      params = params.set('wrk_dateFrom', wrk_dateFrom);
    }

    if (wrk_dateTo) {
      params = params.set('wrk_dateTo', wrk_dateTo);
    }

    if (wrk_fullname) {
      params = params.set('wrk_fullname', wrk_fullname);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(wrk_order) {
      params = params.set('wrk_order', wrk_order);
    }

    return this._http.get<WorkResults>(`${environment.apiUrl}works/${cmp_uuid}`, { headers, params });
  }

  public getWorkById(cmp_uuid: string, wrk_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'work/' + cmp_uuid + '/' + wrk_uuid, {headers:headers});
  }

  public saveWork(work: any): Observable<any> {
    let params = JSON.stringify(work);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'work', params, {headers:headers});
  }

  public updateWork(work: any): Observable<any> {
    let params = JSON.stringify(work);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'work/' + work.cmp_uuid + '/' + work.wrk_uuid, params, {headers:headers});
  }

  public deleteWork(cmp_uuid: string, wrk_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'work/' + cmp_uuid + '/' + wrk_uuid, {headers:headers});
  }

  public getPendingWorks(cmp_uuid: string, wrks_uuid?: string, page?: number, perPage?: number, field_order?: string, wrk_order?: string): Observable<WorkResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (wrks_uuid) {
      params = params.set('wrks_uuid', wrks_uuid);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(wrk_order) {
      params = params.set('wrk_order', wrk_order);
    }

    return this._http.get<WorkResults>(`${environment.apiUrl}pending-works/${cmp_uuid}`, { headers, params });
  }
}
