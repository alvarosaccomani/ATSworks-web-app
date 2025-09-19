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
}
