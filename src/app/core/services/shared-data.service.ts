import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

  // BehaviorSubject para almacenar el valor seleccionado
  private selectedCompanySubject = new BehaviorSubject<any>(null);
  public selectedCompany$ = this.selectedCompanySubject.asObservable();

  // Método para actualizar el valor seleccionado
  public setSelectedCompany(company: any): void {
    this.selectedCompanySubject.next(company);
  }
}
