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
}
