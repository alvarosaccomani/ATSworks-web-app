import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBarComponent } from '../../../shared/components/side-bar/side-bar.component';

@Component({
  selector: 'app-user-layout',
  imports: [
    CommonModule,
    RouterModule,
    SideBarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

}
