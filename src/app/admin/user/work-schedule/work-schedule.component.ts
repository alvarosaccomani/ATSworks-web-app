import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorkStateInterface } from '../../../core/interfaces/work-state';
import { WorkStatesService } from '../../../core/services/work-states.service';
import { WorksService } from '../../../core/services/works.service';
import { WorkResults } from '../../../core/interfaces/work';
import { SessionService } from '../../../core/services/session.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-work-schedule',
  imports: [
    FormsModule,
    NzIconModule,
    NzSelectModule,
    NzBadgeModule,
    NzCalendarModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './work-schedule.component.html',
  styleUrl: './work-schedule.component.scss'
})
export class WorkScheduleComponent {

  // Variables para filtros
  public searchDateFrom: string = "";
  public searchDateTo: string = "";
  public searchWorkState: string = "bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823";
  public searchRoute: string = "";
  public fieldSortValue: string = "wrk_workdate";
  public sortValue: string = "ASC";

  private cmp_uuid!: string;
  public worksScheduler: WorkResults[] = [];
  public workStates: WorkStateInterface[] = [];
  public isLoadingWorkStates: boolean = false;
  public eventsByDate: { [key: string]: string[] } = {}; // clave = 'YYYY-MM-DD', valor = lista de clientes
  public monthCounts: { [key: string]: number } = {}; // clave: 'YYYY-MM', valor: cantidad
  public headerConfig: any = {
    title: "CALENDARIO DE TRABAJOS",
    description: "Calendario de Trabajos.",
    icon: "fas fa-calendar fa-fw"
  }
  public dataTabs: any = [
    {
      url: ['/admin/user/work','new'],
      icon: "fas fa-plus fa-fw",
      title: "NUEVO TRABAJO"
    },
    {
       url: ['/admin/user/works'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE TRABAJOS"
    },
    {
       url: ['/admin/user/pending-works'],
       icon: "fas fa-hand-holding-usd fa-fw",
       title: "TRABAJOS PENDIENTES"
    },
    {
       url: ['/admin/user/work-schedule'],
       icon: "fas fa-calendar fa-fw",
       title: "CALENDARIO DE TRABAJOS"
    }
  ]

  constructor(
    private _sessionService: SessionService,
    private _workStatesService: WorkStatesService,
    private _worksService: WorksService,
    private _sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getWorkStates(this.cmp_uuid!);

    this.getWorkScheduler(this.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchWorkState, this.searchRoute, this.fieldSortValue, this.sortValue);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.getWorkScheduler(company.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchWorkState, this.searchRoute, this.fieldSortValue, this.sortValue);
      }
    });
  }

  private getWorkStates(cmp_uuid: string) {
    this._workStatesService.getWorkStates(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.isLoadingWorkStates = false;
          this.workStates = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public filter(): void {
    this.getWorkScheduler(this.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchWorkState, this.searchRoute, this.fieldSortValue, this.sortValue);
  }

  public clearSearch(): void {
    this.searchWorkState = "bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823",
    this.searchRoute = "Lunes";
  }

  private getWorkScheduler(cmp_uuid: string, wrk_dateFrom: string, wrk_dateTo: string, wrks_uuid: string, wrk_route: string, field_order: string, wrk_order: string) {
    this._worksService.getWorkScheduler(cmp_uuid, wrk_dateFrom, wrk_dateTo, wrks_uuid, wrk_route, field_order, wrk_order).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.worksScheduler = response.data;
          this.buildEventsByDate(response.data);
          this.buildMonthCounts(response.data);
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private buildEventsByDate(workItems: any) {
    this.eventsByDate = {};

    for (const item of workItems) {
      const date = new Date(item.wrk_workdate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // meses son 0-indexados
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!this.eventsByDate[dateKey]) {
        this.eventsByDate[dateKey] = [];
      }

      this.eventsByDate[dateKey].push(item.wrk_customer);
    }
  }

  public getCustomersByDate(date: Date): string[] {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.eventsByDate[key] || [];
  }

  private buildMonthCounts(workItems: any) {
    this.monthCounts = {};

    for (const item of workItems) {
      const date = new Date(item.wrk_workdate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // meses 01–12
      const key = `${year}-${month}`;

      this.monthCounts[key] = (this.monthCounts[key] || 0) + 1;
    }
  }

  public getMonthData(date: Date): number | null {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    return this.monthCounts[key] ?? null;
  }
}
