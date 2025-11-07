import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserInterface } from '../../../core/interfaces/user';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { UserRolCompanyResults } from '../../../core/interfaces/user-rol-company';
import { CompanyItemResults } from '../../../core/interfaces/company-item';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MessageService } from '../../../core/services/message.service';
import { CompanyItemsService } from '../../../core/services/company-items.service';

declare var $:any;

@Component({
  selector: 'app-nav-bar',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  @Input() identity!: UserInterface;
  public company!: any;
  public selectedCompany!: any;
  public userRolesCompany$!: Observable<UserRolCompanyResults>;
  public userRolesCompany!: any;
  public companyItems$!: Observable<CompanyItemResults>;

  constructor(
    private _router: Router,
    private _sharedDataService: SharedDataService,
    private _messageService: MessageService,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _companyItemsService: CompanyItemsService
  ) { }

  ngOnInit(): void {
    /*  Exit system buttom */
    $('.btn-exit-system').on('click', (e: any) => {
      e.preventDefault();
      this._messageService.showCustomMessage({
          title: "¿Estás seguro de cerrar la sesión?",
          type: "question",
          text: "Estás a punto de cerrar la sesión y salir del sistema.",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: "Sí, cerrar sesión",
          cancelButtonText: "Cancelar"
        },
        (result: any) => {
          if (result.value) {
            localStorage.clear();
            this._router.navigate(['/auth/login']);
          }
        }
      );
    });

    if(this.identity) {
      this.userRolesCompany$ = this._userRolesCompanyService.getUserRolesCompanyByUser(this.identity.usr_uuid!);
      this.userRolesCompany$.subscribe((userRolesCompany: any) => {
        this.userRolesCompany = this.groupByCompany(userRolesCompany.data);
        if(this.userRolesCompany.length === 1) {
          this.selectedCompany = this.userRolesCompany[0].cmp.cmp_uuid;
        }
        //Obtengo Company Items
        this.companyItems$ = this._companyItemsService.getCompanyItems(userRolesCompany.data[0].cmp.cmp_uuid!);
        this.companyItems$.subscribe((companyItems: any) => {
          localStorage.setItem('companyItems', JSON.stringify(companyItems.data));;
        });
      });
    }

    this.company = JSON.parse(localStorage.getItem('company')!);
    if(this.company) {
      this.selectedCompany = this.company.cmp_uuid;
      this._sharedDataService.setSelectedCompany({cmp: this.company});
    }
  }

  public showCloseNavBar(): void {
    var NavLateral = $('.nav-lateral');
    var PageConten = $('.page-content');
    if (NavLateral.hasClass('active')) {
      NavLateral.removeClass('active');
      PageConten.removeClass('active');
    } else {
      NavLateral.addClass('active');
      PageConten.addClass('active');
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

  public onCompanyChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedCompany = this.userRolesCompany.find(
      (company: any) => company.cmp.cmp_uuid === selectedValue
    );
    if (selectedCompany) {
      localStorage.setItem('company', JSON.stringify(selectedCompany.cmp));
      //Obtengo Company Items
      this.companyItems$ = this._companyItemsService.getCompanyItems(selectedCompany.cmp.cmp_uuid!);
      this.companyItems$.subscribe((companyItems: any) => {
        localStorage.setItem('companyItems', JSON.stringify(companyItems.data));;
      });
      this._sharedDataService.setSelectedCompany(selectedCompany);
      this._router.navigate(['/admin/user/dashboard']);
    }
  }

}
