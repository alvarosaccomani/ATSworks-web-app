import { Component, OnInit } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  ngOnInit(): void {
    /*  Show/Hidden Nav Lateral */
    $('.show-nav-lateral').on('click', function(e: any) {
      e.preventDefault();
      var NavLateral=$('.nav-lateral');
      var PageConten=$('.page-content');
      if (NavLateral.hasClass('active')) {
        NavLateral.removeClass('active');
        PageConten.removeClass('active');
      } else {
        NavLateral.addClass('active');
        PageConten.addClass('active');
      }
    });
  }

}
