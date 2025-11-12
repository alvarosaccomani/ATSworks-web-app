import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SessionService } from '../../../core/services/session.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MenuService } from '../../../core/services/menu.service';
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

  private cmp_uuid!: string;
  private company!: any;
  public menuItems: any;
  public headerConfig: any = {
    title: "DASHBOARD",
    description: "Estadísticas.",
    icon: "fab fa-dashcube fa-fw"
  }

  constructor(
    private _sessionService: SessionService,
    private _sharedDataService: SharedDataService,
    private _menuService: MenuService,
    private _dashboardsService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.company = this._sessionService.getCompany();
    this.loadDashboard();

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      this.loadDashboard();
    });

  }

  private loadDashboard(): void {
    if(this.company) {
      this.cmp_uuid = this.company.cmp_uuid;
      this._dashboardsService.getDashboards(this.cmp_uuid).subscribe(
        (response: any) => {
          if(response.success) {
            const dashboard = response.data;
            this._menuService.updateDashboardItems(dashboard, this.cmp_uuid).subscribe({
              next: (filteredItems: any[]) => {
                this.menuItems = filteredItems; // ← Esto ahora recibe los items filtrados
              },
              error: (error) => {
                console.error('Error filtering dashboard items:', error);
              }
            });
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
  }
}
