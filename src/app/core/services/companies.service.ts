import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyResults } from '../interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getCompanyById(cmp_uuid: string): Observable<CompanyResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get<CompanyResults>(environment.apiUrl + 'company/' + cmp_uuid, {headers:headers})
  }

  public saveCompany(company: any): Observable<any> {
    let params = JSON.stringify(company);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'company', params, {headers:headers});
  }

  public updateCompany(company: any): Observable<any> {
    let params = JSON.stringify(company);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(environment.apiUrl + 'company/' + company.cmp_uuid, params, {headers:headers});
  }
}
