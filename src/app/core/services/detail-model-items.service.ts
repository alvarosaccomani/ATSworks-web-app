import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetailModelItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  public insertDetailModelItem(detailModelItem: any): Observable<any> {
    let params = JSON.stringify(detailModelItem);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'detail-model-item', params, {headers:headers});
  }

  public updateDetailModelItem(detailModelItem: any): Observable<any> {
    let params = JSON.stringify(detailModelItem);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'detail-model-item/' + detailModelItem.cmp_uuid + '/' + detailModelItem.itm_uuid  + '/' + detailModelItem.cmpitm_uuid + '/' + detailModelItem.mitm_uuid + '/' + detailModelItem.dmitm_uuid, params, {headers:headers});
  }
}
