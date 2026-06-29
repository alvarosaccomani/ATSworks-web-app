import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuResults } from '../interfaces/menu';

@Injectable({
  providedIn: 'root',
})
export class AppMenusService {
  
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los menús con paginación y filtros.
   */
  public getMenus(
    mnu_title?: string,
    page?: number,
    perPage?: number,
    field_order?: string,
    mnu_orderby?: string
  ): Observable<MenuResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();

    if (mnu_title) {
      params = params.set('mnu_title', mnu_title);
    }
    if (page) {
      params = params.set('page', page.toString());
    }
    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }
    if (field_order) {
      params = params.set('field_order', field_order);
    }
    if (mnu_orderby) {
      params = params.set('mnu_orderby', mnu_orderby);
    }

    return this._http.get<MenuResults>(`${environment.apiUrl}menus`, { headers, params });
  }

  /**
   * Obtiene un menú por su UUID.
   */
  public getMenuById(mnu_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get(`${environment.apiUrl}menu/${mnu_uuid}`, { headers });
  }

  /**
   * Crea un nuevo menú.
   */
  public saveMenu(menu: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(menu);
    return this._http.post(`${environment.apiUrl}menu`, params, { headers });
  }

  /**
   * Actualiza un menú existente.
   */
  public updateMenu(menu: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(menu);
    return this._http.put(`${environment.apiUrl}menu/${menu.mnu_uuid}`, params, { headers });
  }

  /**
   * Elimina un menú por su UUID.
   */
  public deleteMenu(mnu_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}menu/${mnu_uuid}`, { headers });
  }

  /**
   * Obtiene los ítems del menú en formato de árbol.
   */
  public getMenuItemsTree(): Observable<{ data: any[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<{ data: any[] }>(`${environment.apiUrl}menu-tree`, { headers, params });
  }

  /**
   * Obtiene los ítems del menú configurados para el dashboard.
   */
  public getDashboardMenuItems(): Observable<{ data: any[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any[] }>(`${environment.apiUrl}menu-dashboard`, { headers });
  }
}
