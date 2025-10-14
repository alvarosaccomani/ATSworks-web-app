import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionFormResults } from '../interfaces/collection-form';

@Injectable({
  providedIn: 'root'
})
export class CollectionFormsService {

  constructor(
    private _http: HttpClient
  ) { }
  
  public getCollectionForms(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<CollectionFormResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<CollectionFormResults>(environment.apiUrl + 'collection-forms/' + cmp_uuid + '/' + filter, {headers:headers})
  }
}
