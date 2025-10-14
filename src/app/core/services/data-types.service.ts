import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataTypesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getDataTypes(filter: string, page?: number, perPage?: number): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get(environment.apiUrl + 'data-types/' + filter, {headers:headers})
  }
}
