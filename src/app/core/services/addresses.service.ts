import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { AddressResults  } from '../interfaces/address';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getAddresses(cmp_uuid: string, cus_uuid: string, filter?: string, page?: number, perPage?: number): Observable<AddressResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<AddressResults>(this._GlobalService.url + 'addresses/' + cmp_uuid + '/' + cus_uuid + '/' + filter, {headers:headers})
  }

  public getAddressById(cmp_uuid: string, cus_uuid?: string, adr_uuid?: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(this._GlobalService.url + 'address/' + cmp_uuid + '/' + cus_uuid + '/' + adr_uuid, {headers:headers});
  }

  public saveAddress(address: any): Observable<any> {
    let params = JSON.stringify(address);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'address', params, {headers:headers});
  }

  public updateAddress(address: any): Observable<any> {
    let params = JSON.stringify(address);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'address/' + address.cmp_uuid + '/' + address.cus_uuid + '/' + address.adr_uuid, params, {headers:headers});
  }

  public deleteAddress(cmp_uuid: string, cus_uuid: string, adr_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(this._GlobalService.url + 'address/' + cmp_uuid + '/' + cus_uuid+ '/' + adr_uuid, {headers:headers});
  }
}
