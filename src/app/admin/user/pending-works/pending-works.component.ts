import { Component } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorksService } from '../../../core/services/works.service';
import { WorkInterface, WorkResults } from '../../../core/interfaces/work';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-pending-works',
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './pending-works.component.html',
  styleUrl: './pending-works.component.scss'
})
export class PendingWorksComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  // Variables para filtros
  public searchWorkState: string = "bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823";
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

    this.works$ = this._worksService.getPendingWorks(this.cmp_uuid, this.searchWorkState, this.page, this.perPage, this.fieldSortValue, this.sortValue);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.works$ = this._worksService.getPendingWorks(company.cmp_uuid, this.searchWorkState, this.page, this.perPage, this.fieldSortValue, this.sortValue);
      }
    });
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
                this.works$ = this._worksService.getPendingWorks(this.cmp_uuid, this.searchWorkState, this.page, this.perPage, this.fieldSortValue, this.sortValue);
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
    this.works$ = this._worksService.getPendingWorks(this.cmp_uuid, this.searchWorkState, page, this.perPage, this.fieldSortValue, this.sortValue);
  }
}
