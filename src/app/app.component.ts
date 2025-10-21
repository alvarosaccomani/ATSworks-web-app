import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { ConnectionService } from './core/services/connection.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NzMessageModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ATSworks-web-app';
  private connectionSubscription!: Subscription;

  constructor(
    private _nzMessageService: NzMessageService,
    private _connectionService: ConnectionService
  ) {}

  ngOnInit() {
    this.connectionSubscription = this._connectionService.connectionStatus$.subscribe((isOnline) => {
      if (isOnline) {
        this._nzMessageService.success('Conexión restablecida', { nzDuration: 3000 });
      } else {
        this._nzMessageService.error('Sin conexión a Internet', { nzDuration: 3000 });
      }
    });
  }

  ngOnDestroy() {
    this.connectionSubscription.unsubscribe();
  }
}
