import { Component } from '@angular/core';
import { UpdateService } from '../../../core/services/update.service';

@Component({
  selector: 'app-update-notification',
  imports: [],
  templateUrl: './update-notification.component.html',
  styleUrl: './update-notification.component.scss'
})
export class UpdateNotificationComponent {

  updateAvailable = false;

  constructor(
    private _updateService: UpdateService
  ) {}

  ngOnInit(): void {
    this._updateService.updateAvailable$.subscribe((available: any) => {
      this.updateAvailable = available;
    });
  }

  reload(): void {
    this._updateService.reloadApp();
  }

  dismiss(): void {
    this._updateService.dismissUpdate();
  }
}
