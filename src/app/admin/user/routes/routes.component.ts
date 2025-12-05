import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { RoutesService } from '../../../core/services/routes.service';
import { RouteInterface, RouteResults } from '../../../core/interfaces/route';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-routes',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss'
})
export class RoutesComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  private cmp_uuid!: string;
  public routes$!: Observable<RouteResults>;
  public headerConfig: any = {
    title: "LISTA DE RECORRIDOS",
    description: "Listado de Recorridos.",
    icon: "fas fa-clipboard-list fa-fw"
  }
  public dataTabs: any = [
    {
      url: ['/admin/user/route', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR RECORRIDO"
    },
    {
        url: ['/admin/user/routes'],
        icon: "fas fa-clipboard-list fa-fw",
        title: "LISTA DE RECORRIDOS"
    }
  ]
  
  constructor(
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _routesService: RoutesService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this.routes$ = this._routesService.getRoutes(this.cmp_uuid, "null", 1, 20);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.routes$ = this._routesService.getRoutes(company.cmp_uuid, "null", this.page, this.perPage);
      }
    });
  }
  
  public deleteRoute(route: RouteInterface) {
    this._messageService.showCustomMessage({
        title: "¿Estás seguro de eliminar el Recorrido?",
        type: "question",
        text: "Estás a punto de eliminar el Recorrido.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._routesService.deleteRoute(route.cmp_uuid!, route.rou_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.routes$ = this._routesService.getRoutes(route.cmp_uuid!, "null", this.page, this.perPage);
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
    this.routes$ = this._routesService.getRoutes(this.cmp_uuid, "null", page, this.perPage);
  }
}
