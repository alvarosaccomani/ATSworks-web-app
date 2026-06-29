import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket;

  constructor() {
    // Clean api suffix to obtain WS server base url
    const socketUrl = environment.apiUrl.replace('/api/', '').replace('/api', '');
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });
  }

  public onEvent(eventName: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.off(eventName);
      };
    });
  }

  public emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
