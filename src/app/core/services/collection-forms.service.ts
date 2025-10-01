import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { CollectionFormResults } from '../interfaces/collection-form';

@Injectable({
  providedIn: 'root'
})
export class CollectionFormsService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }
  
  public getCollectionForms(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<CollectionFormResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<CollectionFormResults>(this._GlobalService.url + 'collection-forms/' + cmp_uuid + '/' + filter, {headers:headers})
  }
}
