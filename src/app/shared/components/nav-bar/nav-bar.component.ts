import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var $:any;
declare var Swal: any;

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  constructor(
    private _router: Router
  ) { }

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

    /*  Exit system buttom */
    $('.btn-exit-system').on('click', (e: any) => {
      e.preventDefault();
      Swal.fire({
        title: 'Are you sure to close the session?',
        text: "You are about to close the session and exit the system",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, exit!',
        cancelButtonText: 'No, cancel'
      }).then((result: any) => {
        if (result.value) {
          this._router.navigate(['/auth/login'])
        }
      });
    });
  }

}
