import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupDetailModelItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getGroupDetailModelItemById(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string, gdmitm_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'group-detail-model-item/' + cmp_uuid + '/' + itm_uuid + '/' + cmpitm_uuid + '/' + mitm_uuid + '/' + gdmitm_uuid, {headers:headers});
  }
}
