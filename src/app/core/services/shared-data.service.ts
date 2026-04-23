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

  // Sidebar State
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(true);
  public sidebarVisible$ = this.sidebarVisibleSubject.asObservable();

  private sidebarMiniSubject = new BehaviorSubject<boolean>(false);
  public sidebarMini$ = this.sidebarMiniSubject.asObservable();

  // Método para actualizar el valor seleccionado
  public setSelectedCompany(company: any): void {
    this.selectedCompanySubject.next(company);
  }

  public toggleSidebarVisibility(): void {
    this.sidebarVisibleSubject.next(!this.sidebarVisibleSubject.value);
  }

  public toggleSidebarMini(): void {
    this.sidebarMiniSubject.next(!this.sidebarMiniSubject.value);
  }

  /**
   * Unified toggle:
   * Desktop (>768px): Toggles Mini Mode
   * Mobile (<=768px): Toggles Visibility
   */
  public toggleSidebarMain(): void {
    if (window.innerWidth > 768) {
      this.toggleSidebarMini();
      if (!this.sidebarVisibleSubject.value) {
        this.setSidebarVisible(true);
      }
    } else {
      this.toggleSidebarVisibility();
    }
  }

  public setSidebarMini(val: boolean): void {
    this.sidebarMiniSubject.next(val);
  }

  public setSidebarVisible(val: boolean): void {
    this.sidebarVisibleSubject.next(val);
  }
}
