import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResourceTypeResults } from '../interfaces/resource-type';

@Injectable({
  providedIn: 'root'
})
export class ResourcesTypesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getResourcesTypes(filter?: string, page?: number, perPage?: number): Observable<ResourceTypeResults> {
    let headers = new HttpHeaders().set('content-type','application/json');

    if(page && perPage) {
      filter = `${filter}/${page}/${perPage}`;
    }

    return this._http.get<ResourceTypeResults>(environment.apiUrl + 'resources-types/' + filter, {headers:headers})
  }
}
