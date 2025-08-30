import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { UserRolCompanyInterface, UserRolCompanyResults } from '../../../core/interfaces/user-rol-company';

declare var $:any;
declare var Swal: any;

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  @Input() identity!: UserInterface;
  public userRolesCompany$!: Observable<UserRolCompanyResults>;
  public userRolesCompany!: any;

  constructor(
    private _router: Router,
    private _userRolesCompany: UserRolesCompanyService
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
          localStorage.clear();
          this._router.navigate(['/auth/login']);
        }
      });
    });

    if(this.identity) {
      this.userRolesCompany$ = this._userRolesCompany.getUserRolesCompany(this.identity.usr_uuid!);
      this.userRolesCompany$.subscribe((userRolesCompany: any) => {
        this.userRolesCompany = this.groupByCompany(userRolesCompany.data);
      });
    }
  }

  public groupByCompany(data: any[]): any[] {
    const grouped = new Map();

    data.forEach((item) => {
      const cmpUuid = item.cmp.cmp_uuid;

      if (!grouped.has(cmpUuid)) {
        grouped.set(cmpUuid, {
          cmp: {
            cmp_uuid: item.cmp.cmp_uuid,
            cmp_name: item.cmp.cmp_name,
            roles: [],
          },
        });
      }

      grouped.get(cmpUuid).cmp.roles.push({
        rol_uuid: item.rol.rol_uuid,
        rol_name: item.rol.rol_name,
      });
    });

    return Array.from(grouped.values());
  }

}
