import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  public getItems(filter: string, page?: number, perPage?: number): Observable<ItemResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<ItemResults>(environment.apiUrl + 'items/' + filter, {headers:headers})
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
