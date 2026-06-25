import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkHistoryResults } from '../interfaces/work-history';

@Injectable({
  providedIn: 'root'
})
export class WorksHistoryService {

  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene todos los materiales.
   * @returns Observable de un array con el historico de una orden.
   */
  public getworkHistory(cmp_uuid: string, wrk_uuid: string): Observable<WorkHistoryResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<WorkHistoryResults>(`${environment.apiUrl}work-history/${cmp_uuid}/${wrk_uuid}`, { headers, params });
  }
}
