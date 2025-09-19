import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { CustomerResults  } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getCustomers(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<CustomerResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<CustomerResults>(this._GlobalService.url + 'customers/' + cmp_uuid + '/' + filter, {headers:headers})
  }

  public getCustomerById(cmp_uuid: string, cus_uuid?: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(this._GlobalService.url + 'customer/' + cmp_uuid + '/' + cus_uuid, {headers:headers});
  }

  public saveCustomer(customer: any): Observable<any> {
    let params = JSON.stringify(customer);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'customer', params, {headers:headers});
  }

  public updateCustomer(customer: any): Observable<any> {
    let params = JSON.stringify(customer);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'customer/' + customer.cmp_uuid + '/' + customer.cus_uuid, params, {headers:headers});
  }
}
