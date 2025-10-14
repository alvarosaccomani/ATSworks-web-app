import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressResults  } from '../interfaces/address';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getAddresses(cmp_uuid: string, cus_uuid: string, filter?: string, page?: number, perPage?: number): Observable<AddressResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<AddressResults>(environment.apiUrl + 'addresses/' + cmp_uuid + '/' + cus_uuid + '/' + filter, {headers:headers})
  }

  public getAddressById(cmp_uuid: string, cus_uuid?: string, adr_uuid?: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'address/' + cmp_uuid + '/' + cus_uuid + '/' + adr_uuid, {headers:headers});
  }

  public saveAddress(address: any): Observable<any> {
    let params = JSON.stringify(address);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'address', params, {headers:headers});
  }

  public updateAddress(address: any): Observable<any> {
    let params = JSON.stringify(address);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'address/' + address.cmp_uuid + '/' + address.cus_uuid + '/' + address.adr_uuid, params, {headers:headers});
  }

  public deleteAddress(cmp_uuid: string, cus_uuid: string, adr_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'address/' + cmp_uuid + '/' + cus_uuid+ '/' + adr_uuid, {headers:headers});
  }
}
