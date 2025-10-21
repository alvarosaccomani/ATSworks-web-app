import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private connectionStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    window.addEventListener('online', this.updateConnectionStatus);
    window.addEventListener('offline', this.updateConnectionStatus);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.updateConnectionStatus);
    window.removeEventListener('offline', this.updateConnectionStatus);
  }

  private updateConnectionStatus = () => {
    this.connectionStatus.next(navigator.onLine);
  };

  public isOnline(): boolean {
    return navigator.onLine;
  }
}
