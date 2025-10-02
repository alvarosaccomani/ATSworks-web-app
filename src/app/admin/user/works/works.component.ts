import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorksService } from '../../../core/services/works.service';
import { WorkInterface, WorkResults } from '../../../core/interfaces/work';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

declare var Swal: any;

@Component({
  selector: 'app-works',
  imports: [
    AsyncPipe,
    RouterLink,
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
       url: null,
       icon: "fas fa-hand-holding-usd fa-fw",
       title: "TRABAJOS PENDIENTES"
    }
  ]

  constructor(
      private _worksService: WorksService,
      private _sharedDataService: SharedDataService
    ) { }

  ngOnInit(): void {
    this.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.works$ = this._worksService.getWorks(this.cmp_uuid, "null", this.page, this.perPage);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.works$ = this._worksService.getWorks(company.cmp.cmp_uuid, "null", this.page, this.perPage);
      }
    });
  }

  public deleteWork(work: WorkInterface) {
    Swal.fire({
        title: '¿Desea eliminar el Trabajo?',
        text: "Esta a punto de eliminar el Trabajo",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'No, cancelar'
      }).then((result: any) => {
        if (result.value) {
          this._worksService.deleteWork(work.cmp_uuid!, work.wrk_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.works$ = this._worksService.getWorks(work.cmp_uuid!, "null", this.page, this.perPage);
              },
              error => {
                console.log(<any>error);
              }
            );
        }
      });
  }

  public goToPage(page: number): void {
    this.page = page;
    this.works$ = this._worksService.getWorks(this.cmp_uuid, "null", page, this.perPage);
  }
}
