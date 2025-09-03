import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { ModelItemResults } from '../interfaces/model-item';

@Injectable({
  providedIn: 'root'
})
export class ModelItemsService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getModelItems(filter: string, page?: number, perPage?: number): Observable<ModelItemResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<ModelItemResults>(this._GlobalService.url + 'model-items/' + filter, {headers:headers})
  }
}
