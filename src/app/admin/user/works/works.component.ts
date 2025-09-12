import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorksService } from '../../../core/services/works.service';
import { WorkResults } from '../../../core/interfaces/work';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-works',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss'
})
export class WorksComponent {

  public works$!: Observable<WorkResults>;
  public headerConfig: any = {
    title: "LISTA DE TRABAJOS",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
    icon: "fas fa-clipboard-list fa-fw"
  }
  public dataTabs: any = [
    {
      url: null,
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
    let cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.works$ = this._worksService.getWorks(cmp_uuid);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.works$ = this._worksService.getWorks(company.cmp.cmp_uuid);
      }
    });
  }
}
