import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserInterface } from '../../../core/interfaces/user';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { UserRolCompanyResults } from '../../../core/interfaces/user-rol-company';
import { CompanyItemResults } from '../../../core/interfaces/company-item';
import { RouteService } from '../../../core/services/route.service';
import { SessionService } from '../../../core/services/session.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MenuService } from '../../../core/services/menu.service';
import { MessageService } from '../../../core/services/message.service';
import { CompanyItemsService } from '../../../core/services/company-items.service';
import { NzSelectModule } from 'ng-zorro-antd/select';


declare var $:any;

@Component({
  selector: 'app-nav-bar',
  imports: [
    FormsModule,
    RouterLink,
    NzSelectModule

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
  public isCustomer: boolean = false;
  public hasMultipleContexts: boolean = false;
  public currentContext: 'admin' | 'customer' = 'admin';

  constructor(
    private _router: Router,
    private _route: RouteService,
    private _sessionService: SessionService,
    private _sharedDataService: SharedDataService,
    private _messageService: MessageService,
    private _menuService: MenuService,
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
          this.company = this.userRolesCompany[0];
          this.selectedCompany = this.company.cmp_uuid;
          this._sessionService.setCompany(JSON.stringify(this.company));
          this.checkIsCustomer();
        }
        //Obtengo Company Items
        this.companyItems$ = this._companyItemsService.getCompanyItems(userRolesCompany.data[0].cmp.cmp_uuid!);
        this.companyItems$.subscribe((companyItems: any) => {
          this._sessionService.setCompanyItems(companyItems.data);
        });

        if(!this.selectedCompany) {
          this._router.navigate(['/admin/user/no-company']);
        } else {
          // Inicializar el menú con los datos del usuario
          this._menuService.initialize(
            this.userRolesCompany[0].roles.map((item: any) => item.rol_name),
            this.selectedCompany
          );
          
          if(this._route.getCurrentRoute() === '/admin/user/dashboard' || this._route.getCurrentRoute() === '/admin/user/no-company') {
            if (this.isCustomer && !this.hasAdminRole()) {
              this._router.navigate(['/customer/customer-works']);
            } else {
              this._router.navigate(['/admin/user/dashboard']);
            }
          }
        }
      });
    }

    this.company = this._sessionService.getCompany();
    if(this.company) {
      this.selectedCompany = this.company.cmp_uuid;
      this._sharedDataService.setSelectedCompany(this.company);
      this.checkIsCustomer();
    }
  }

  private checkIsCustomer(): void {
    if (this.company && this.company.roles) {
      const roles = this.company.roles.map((r: any) => r.rol_name.toLowerCase());
      
      this.isCustomer = roles.some((r: string) => r.includes('client') || r.includes('cliente'));
      
      const hasAdmin = roles.some((r: string) => !r.includes('client') && !r.includes('cliente'));
      
      this.hasMultipleContexts = this.isCustomer && hasAdmin;
      this.currentContext = this._router.url.includes('/customer') ? 'customer' : 'admin';
    } else {
      this.isCustomer = false;
      this.hasMultipleContexts = false;
    }
  }

  private hasAdminRole(): boolean {
    if (!this.company || !this.company.roles) return false;
    return this.company.roles.some((r: any) => {
      const name = r.rol_name.toLowerCase();
      return !name.includes('client') && !name.includes('cliente');
    });
  }

  public showCloseNavBar(): void {
    this._sharedDataService.toggleSidebarVisibility();
  }

  public groupByCompany(data: any[]): any[] {
    const grouped = new Map();

    data.forEach((item) => {
      const cmpUuid = item.cmp.cmp_uuid;

      if (!grouped.has(cmpUuid)) {
        grouped.set(cmpUuid, {
          cmp_uuid: item.cmp.cmp_uuid,
          cmp_name: item.cmp.cmp_name,
          roles: [],
        });
      }

      grouped.get(cmpUuid).roles.push({
        rol_uuid: item.rol.rol_uuid,
        rol_name: item.rol.rol_name,
        rolpers: item.rolpers.map((e: any) => e.per.per_slug)
      });
    });

    return Array.from(grouped.values());
  }

  public onCompanyChange(event: string | Event): void {
    const selectedValue = typeof event === 'string' ? event : (event.target as HTMLSelectElement).value;
    const selectedCompany = this.userRolesCompany.find(
      (company: any) => company.cmp_uuid === selectedValue
    );
    if (selectedCompany) {
      let company = selectedCompany;
      this._sessionService.setCompany(JSON.stringify(company));
      
      // Inicializar el menú con los datos del usuario
      this._menuService.initialize(
        company.roles.map((item: any) => item.rol_name),
        company.cmp_uuid
      );

      //Obtengo Company Items
      this.companyItems$ = this._companyItemsService.getCompanyItems(company.cmp_uuid!);
      this.companyItems$.subscribe((companyItems: any) => {
        this._sessionService.setCompanyItems(companyItems.data);
      });
      this._sharedDataService.setSelectedCompany(selectedCompany);
      this.checkIsCustomer();
      
      if (this.isCustomer && !this.hasAdminRole()) {
        this._router.navigate(['/customer/customer-works']);
      } else {
        this._router.navigate(['/admin/user/dashboard']);
      }
    }
  }

}
