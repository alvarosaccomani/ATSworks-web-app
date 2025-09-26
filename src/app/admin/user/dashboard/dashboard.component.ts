import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DashboardsService } from '../../../core/services/dashboards.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  public menuItems: any;
  public headerConfig: any = {
    title: "DASHBOARD",
    description: "Estadísticas.",
    icon: "fab fa-dashcube fa-fw"
  }

  constructor(
    private _dashboardsService: DashboardsService
  ) { }

  ngOnInit(): void {
    
    let cmp_uuid;
    if(localStorage.getItem('company')) {
      cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    }

    this._dashboardsService.getDashboards(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          const dashboard = response.data;
          this.setDashboard(dashboard);
        } else {
          //this.status = 'error'
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private setDashboard(dashboard: any): void {
    this.menuItems = [
      {
        name: 'Clientes',
        title: 'Clientes',
        icon: 'fas fa-users fa-fw',
        url: '/admin/user/customers',
        description: `${dashboard["customersCount"]} Registrados`,
        allowedRoles: ['admin', 'editor']
      },
      {
        name: 'Items',
        title: 'Items',
        icon: 'fas fa-pallet fa-fw',
        url: '/admin/application/items',
        description: `${dashboard["itemsCount"]} Registrados`,
        allowedRoles: ['admin', 'editor']
      },
      {
        name: 'Modelo Items',
        title: 'Modelo Items',
        icon: 'fas fa-file-invoice-dollar fa-fw',
        url: '/admin/user/models-items',
        description: `${dashboard["modelsItemsCount"]} Registrados`,
        allowedRoles: ['sysadmin']
      },
      {
        name: 'Trabajos',
        title: 'Trabajos',
        icon: 'fas fa-file-invoice-dollar fa-fw',
        url: '/admin/user/works',
        description: `${dashboard["worksCount"]} Registrados`,
        allowedRoles: ['sysadmin']
      },
      {
        name: 'Usuarios',
        title: 'Usuarios',
        icon: 'fas fa-user-secret fa-fw',
        url: '/admin/application/users',
        description: `${dashboard["usersCount"]} Registrados`,
        allowedRoles: ['admin']
      },
      {
        name: 'Empresa',
        title: 'Empresa',
        icon: 'fas fa-store-alt fa-fw',
        url: '/admin/user/company-profile/' + dashboard["cmp_uuid"],
        description: `${dashboard["companiesCount"]} Registradas`
      }
    ];
  }
}
