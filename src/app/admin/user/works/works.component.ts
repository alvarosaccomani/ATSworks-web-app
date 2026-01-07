import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorksService } from '../../../core/services/works.service';
import { WorkInterface, WorkResults } from '../../../core/interfaces/work';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-works',
  imports: [
    FormsModule,
    AsyncPipe,
    DatePipe,
    RouterLink,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss'
})
export class WorksComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  // Variables para filtros
  public searchDateFrom: string = "";
  public searchDateTo: string = "";
  public searchCustomer: string = "";
  public fieldSortValue: string = "wrk_workdate";
  public sortValue: string = "ASC";

  private cmp_uuid!: string;
  public works$!: Observable<WorkResults>;
  public headerConfig: any = {
    title: "LISTA DE TRABAJOS",
    description: "Listado de Trabajos.",
    icon: "fas fa-clipboard-list fa-fw"
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
      private _messageService: MessageService,
      private _worksService: WorksService,
      private _sharedDataService: SharedDataService
    ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.initDate();

    this.works$ = this._worksService.getWorks(this.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchCustomer, this.page, this.perPage, this.fieldSortValue, this.sortValue);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.works$ = this._worksService.getWorks(company.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchCustomer, this.page, this.perPage, this.fieldSortValue, this.sortValue);
      }
    });
  }

  // Formatea una fecha como 'YYYY-MM-DD'
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private initDate(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    // Asigna las fechas formateadas
    this.searchDateFrom = this.formatDate(haceUnMes);
    this.searchDateTo = this.formatDate(hoy); // si tienes otra variable para "hasta"
  }

  public filter(): void {
    this.works$ = this._worksService.getWorks(this.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchCustomer, this.page, this.perPage, this.fieldSortValue, this.sortValue);
  }

  public clearSearch(): void {
    this.initDate();
    this.searchCustomer = "";
  }

  public deleteWork(work: WorkInterface) {
    this._messageService.showCustomMessage({
        title: "¿Estás seguro de eliminar el Trabajo?",
        type: "question",
        text: "Estás a punto de eliminar el Trabajo.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._worksService.deleteWork(work.cmp_uuid!, work.wrk_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.works$ = this._worksService.getWorks(work.cmp_uuid!, this.searchDateFrom, this.searchDateTo, this.searchCustomer, this.page, this.perPage, this.fieldSortValue, this.sortValue);
              },
              error => {
                console.log(<any>error);
              }
            );
        }
      }
    );
  }

  public goToPage(page: number): void {
    this.page = page;
    this.works$ = this._worksService.getWorks(this.cmp_uuid, this.searchDateFrom, this.searchDateTo, this.searchCustomer, page, this.perPage, this.fieldSortValue, this.sortValue);
  }
}
