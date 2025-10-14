import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorksAttachmentsService {

  constructor(
    private _http: HttpClient
  ) { }

  public insertWorAttachment(workAttachment: any): Observable<any> {
    let params = JSON.stringify(workAttachment);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiUrl + 'work-attachment', params, {headers:headers});
  }
}
