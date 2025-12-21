import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  public getCustomers(cmp_uuid: string, cus_fullname?: string, cus_email?: string, page?: number, perPage?: number, field_order?: string, cus_order?: string): Observable<CustomerResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    if (cus_fullname) {
      params = params.set('cus_fullname', cus_fullname);
    }

    if (cus_email) {
      params = params.set('cus_email', cus_email);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(cus_order) {
      params = params.set('cus_order', cus_order);
    }

    return this._http.get<CustomerResults>(`${environment.apiUrl}customers/${cmp_uuid}`, { headers, params });
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
