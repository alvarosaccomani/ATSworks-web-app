import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResourceModuleResults } from '../interfaces/resource-module';

@Injectable({
  providedIn: 'root'
})
export class ResourcesModulesService {

  constructor(
      private _http: HttpClient
  ) { }

  public getResourcesModules(filter?: string, page?: number, perPage?: number): Observable<ResourceModuleResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<ResourceModuleResults>(environment.apiUrl + 'resources-modules/' + filter, {headers:headers})
  }
}
