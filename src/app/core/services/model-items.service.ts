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

  public getModelItems(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<ModelItemResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<ModelItemResults>(this._GlobalService.url + 'model-items/' + cmp_uuid + '/' + filter, {headers:headers})
  }

  public getModelItemById(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(this._GlobalService.url + 'model-item/' + cmp_uuid + '/' + itm_uuid + '/' + cmpitm_uuid + '/' + mitm_uuid, {headers:headers});
  }

  public saveModelItem(modelItem: any): Observable<any> {
    let params = JSON.stringify(modelItem);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'model-item', params, {headers:headers});
  }

  public updateModelItem(modelItem: any): Observable<any> {
    let params = JSON.stringify(modelItem);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'model-item/' + modelItem.cmp_uuid + '/' + modelItem.itm_uuid + '/' + modelItem.cmpitm_uuid + '/' + modelItem.mitm_uuid, params, {headers:headers});
  }

  public deleteModelItem(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(this._GlobalService.url + 'model-item/' + cmp_uuid + '/' + itm_uuid + '/' + cmpitm_uuid + '/' + mitm_uuid, {headers:headers});
  }
}
