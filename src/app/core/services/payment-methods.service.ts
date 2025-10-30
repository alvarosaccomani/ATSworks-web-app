import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentMethodResults } from '../interfaces/payment-method';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  constructor(
    private _http: HttpClient
  ) { }
  
  public getPaymentMethods(cmp_uuid: string, filter?: string, page?: number, perPage?: number): Observable<PaymentMethodResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<PaymentMethodResults>(environment.apiUrl + 'payment-methods/' + cmp_uuid + '/' + filter, {headers:headers})
  }
}
