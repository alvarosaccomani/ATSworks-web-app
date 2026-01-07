import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkStateResults } from '../interfaces/work-state'

@Injectable({
  providedIn: 'root'
})
export class WorkStatesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getWorkStates(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<WorkStateResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<WorkStateResults>(environment.apiUrl + 'work-states/' + cmp_uuid + '/' + filter, {headers:headers})
  }

}
