import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerResults  } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(
    private _http: HttpClient
  ) { }

  public getCustomers(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<CustomerResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<CustomerResults>(environment.apiUrl + 'customers/' + cmp_uuid + '/' + filter, {headers:headers})
  }

  public getCustomerById(cmp_uuid: string, cus_uuid?: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(environment.apiUrl + 'customer/' + cmp_uuid + '/' + cus_uuid, {headers:headers});
  }

  public saveCustomer(customer: any): Observable<any> {
    let params = JSON.stringify(customer);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'customer', params, {headers:headers});
  }

  public updateCustomer(customer: any): Observable<any> {
    let params = JSON.stringify(customer);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'customer/' + customer.cmp_uuid + '/' + customer.cus_uuid, params, {headers:headers});
  }

  public deleteCustomer(cmp_uuid: string, cus_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(environment.apiUrl + 'customer/' + cmp_uuid + '/' + cus_uuid, {headers:headers});
  }
}
