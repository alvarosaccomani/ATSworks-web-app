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

  public getCustomers(filter: string, page?: number, perPage?: number): Observable<CustomerResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<CustomerResults>(this._GlobalService.url + 'customers/' + filter, {headers:headers})
  }
}
