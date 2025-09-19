import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { CompanyResults } from '../interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  constructor(
    private _http: HttpClient,
    private _GlobalService: GlobalService
  ) { }

  public getCompanyById(cmp_uuid: string): Observable<CompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<CompanyResults>(this._GlobalService.url + 'company/' + cmp_uuid, {headers:headers})
  }

  public saveCompany(company: any): Observable<any> {
    let params = JSON.stringify(company);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(this._GlobalService.url + 'company', params, {headers:headers});
  }

  public updateCompany(company: any): Observable<any> {
    let params = JSON.stringify(company);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(this._GlobalService.url + 'company/' + company.cmp_uuid, params, {headers:headers});
  }
}
