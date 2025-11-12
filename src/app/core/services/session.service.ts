import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SessionData {
  identity?: any;
  company?: any;
  token?: string;
  companyItems?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private sessionSubject = new BehaviorSubject<SessionData | null>(this.getStoredSession());
  public session$ = this.sessionSubject.asObservable();

  constructor() { }

  // SETTERS individuales
  public setIdentity(identity: any | string): void {
    const identityObj = typeof identity === 'string' 
      ? JSON.parse(identity) 
      : identity;
    
    const current = this.getCurrentSession();
    const updated = { ...current, identity: identityObj };
    this.updateSession(updated);
  }

  public setCompany(company: any | string): void {
    const companyObj = typeof company === 'string' 
      ? JSON.parse(company) 
      : company;
    
    const current = this.getCurrentSession();
    const updated = { ...current, company: companyObj };
    this.updateSession(updated);
  }

  public setToken(token: string): void {
    const current = this.getCurrentSession();
    const updated = { ...current, token };
    this.updateSession(updated);
  }

  public setCompanyItems(items: any[] | string): void {
    const itemsArray = typeof items === 'string' 
      ? JSON.parse(items) 
      : items;
    
    const current = this.getCurrentSession();
    const updated = { ...current, companyItems: itemsArray };
    this.updateSession(updated);
  }

  // SET completo que acepta tanto objetos como strings JSON
  public setSession(data: Partial<SessionData> | string): void {
    let sessionData: Partial<SessionData>;
    
    if (typeof data === 'string') {
      sessionData = JSON.parse(data);
    } else {
      sessionData = data;
    }
    
    const current = this.getCurrentSession() || {} as SessionData;
    const updated = { ...current, ...sessionData };
    this.updateSession(updated as SessionData);
  }

  // GETTERS tipados
  public getIdentity(): any | null {
    return this.getCurrentSession()?.identity || null;
  }

  public getCompany(): any | null {
    return this.getCurrentSession()?.company || null;
  }

  public getToken(): string | null {
    return this.getCurrentSession()?.token || null;
  }

  public getCompanyItems(): any[] {
    return this.getCurrentSession()?.companyItems || [];
  }

  public getCurrentSession(): SessionData | null {
    return this.sessionSubject.value;
  }

  // Métodos específicos para propiedades comunes del identity
  public getUserId(): number | null {
    return this.getIdentity()?.id || null;
  }

  public getUserName(): string | null {
    return this.getIdentity()?.name || null;
  }

  public getUserEmail(): string | null {
    return this.getIdentity()?.email || null;
  }

  public getUserRole(): string | null {
    return this.getIdentity()?.role || null;
  }

  public hasPermission(permission: string): boolean {
    const permissions = this.getIdentity()?.permissions || [];
    return permissions.includes(permission);
  }

  // CLEAR session
  public clearSession(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(null);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // PRIVATE methods
  private updateSession(session: SessionData): void {
    localStorage.setItem('session', JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  private getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem('session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored session:', error);
      return null;
    }
  }
}
