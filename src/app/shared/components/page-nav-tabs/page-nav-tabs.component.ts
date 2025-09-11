import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-page-nav-tabs',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './page-nav-tabs.component.html',
  styleUrl: './page-nav-tabs.component.scss'
})
export class PageNavTabsComponent {

  @Input() data: any[] = []; // Array de datos de entrada

}
