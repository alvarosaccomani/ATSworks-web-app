import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyItemResults } from '../interfaces/company-item';

@Injectable({
  providedIn: 'root'
})
export class CompanyItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getCompanyItems(cmp_uuid: string): Observable<CompanyItemResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<CompanyItemResults>(environment.apiUrl + 'company-items/' + cmp_uuid, {headers:headers})
  }
}
