import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RolResults } from '../interfaces/rol';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private _http: HttpClient
  ) { }
    
    public getRoles(filter?: string, page?: number, perPage?: number): Observable<RolResults> {
      let headers = new HttpHeaders().set('content-type','application/json');
  
      if(page && perPage) {
        filter = `${filter}/${page}/${perPage}`;
      }
  
      return this._http.get<RolResults>(environment.apiUrl + 'roles/' + filter, {headers:headers})
    }
}
