import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { companyItemResults } from '../interfaces/company-item/company-item-results.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyItemsService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getCompanyItems(cmp_uuid: string): Observable<companyItemResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<companyItemResults>(this._GlobalService.url + 'company-items/' + cmp_uuid, {headers:headers})
  }
}
