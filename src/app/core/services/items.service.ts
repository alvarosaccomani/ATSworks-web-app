import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemResults } from '../interfaces/item/item-results.interface';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getItems(itm_name?: string, itm_description?: string, page?: number, perPage?: number, field_order?: string, itm_orderby?: string): Observable<ItemResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if(itm_name) {
      params = params.set('itm_name', itm_name);
    }

    if(itm_description) {
      params = params.set('itm_description', itm_description);
    }

    if(page) {
      params = params.set('page', page.toString());
    }

    if(perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(itm_orderby) {
      params = params.set('itm_orderby', itm_orderby);
    }

    return this._http.get<ItemResults>(`${environment.apiUrl}items`, { headers, params });
  }

  public getItemById(itm_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'item/' + itm_uuid, {headers:headers});
  }

  public saveItem(item: any): Observable<any> {
    let params = JSON.stringify(item);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'item', params, {headers:headers});
  }

  public updateItem(item: any): Observable<any> {
    let params = JSON.stringify(item);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'item/' + item.itm_uuid, params, {headers:headers});
  }

  public deleteItem(itm_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'item/' + itm_uuid, {headers:headers});
  }
}
