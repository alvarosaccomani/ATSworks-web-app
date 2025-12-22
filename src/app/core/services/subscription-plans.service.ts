import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionPlanResults  } from '../interfaces/subscription-plan';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlansService {

  constructor(
    private _http: HttpClient
  ) { }
  
    public getSubscriptionsPlans(cmp_uuid: string, subp_name?: string, page?: number, perPage?: number, field_order?: string, cus_order?: string): Observable<SubscriptionPlanResults> {
      const headers = new HttpHeaders().set('content-type', 'application/json');
  
      let params = new HttpParams();
  
      if (subp_name) {
        params = params.set('subp_name', subp_name);
      }
  
      if (page) {
        params = params.set('page', page.toString());
      }
  
      if (perPage) {
        params = params.set('perPage', perPage.toString());
      }
  
      if(field_order) {
        params = params.set('field_order', field_order);
      }
  
      if(cus_order) {
        params = params.set('cus_order', cus_order);
      }
  
      return this._http.get<SubscriptionPlanResults>(`${environment.apiUrl}subscription-plans/${cmp_uuid}`, { headers, params });
    }
}
