import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { RouteInterface } from '../../../core/interfaces/route';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { RoutesService } from '../../../core/services/routes.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-route',
  imports: [
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './route.component.html',
  styleUrl: './route.component.scss'
})
export class RouteComponent {

  public route!: RouteInterface;
  public isLoading: boolean = false;
  public headerConfig: any = {};
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
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _routesService: RoutesService,
    private _sharedDataService: SharedDataService
  ) {
    this.isLoading = false;
    this.routeInit();
  }

  ngOnInit(): void {
    this.route.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this._route.params.subscribe( (params) => {
      if(params['rou_uuid'] && params['rou_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR RECORRIDO",
          description: "Ficha para actualizar un Recorrido.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.route.rou_uuid = params['rou_uuid'];
        this.getRouteById(this.route.cmp_uuid!, params['rou_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR RECORRIDO",
          description: "Ficha para agregar un Recorrido.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.route.cmp_uuid = company.cmp_uuid;
        this.getRouteById(this.route.cmp_uuid!, this.route.rou_uuid!);
      }
    });
  }

  public routeInit(): void {
    this.route = {
      cmp_uuid: null,
      rou_uuid: 'new',
      rou_name: null,
      rou_order: null,
      rou_description: null,
      rou_bkcolor: null,
      rou_frcolor: null,
      rou_active: null,
      rou_createdat: null,
      rou_updatedat: null
    }
  }

  private getRouteById(cmp_uuid: string, rou_uuid: string): void {
    this._routesService.getRouteById(cmp_uuid, rou_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.route = response.data;
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

  private validate(): boolean {
    if(!this.route.rou_name) {
      this._messageService.error(
        "Error", 
        "El nombre de recorrido no puede estar vacio."
      );
      return false;
    }

    if(this.route.rou_name.length > 255) {
      this._messageService.error(
        "Error", 
        "El nombre no puede superar los 255 caracteres."
      );
      return false;
    }

    if(!this.route.rou_order) {
      this._messageService.error(
        "Error", 
        "El orden no puede estar vacio."
      );
      return false;
    }

    return true;
  }

  private async updateRoute(formRoute: NgForm): Promise<void> {
    this.isLoading = true;
    this._routesService.updateRoute(formRoute.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const route = response.route;
          this._messageService.success(
            "Informacion", 
            "El Recorrido fue actualizado correctamente.",
            () => {
              this._router.navigate(['/admin/user/routes']);
            }
          );
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private async insertRoute(formRoute: NgForm): Promise<void> {
    this.isLoading = true;
      this._routesService.saveRoute(formRoute.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const route = response.route;
            this._messageService.success(
              "Informacion", 
              "El Recorrido fue agregado correctamente.",
              () => {
                this._router.navigate(['/admin/user/routes']);
              }
            );
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage != null) {
              this._messageService.error(
                "Error", 
                errorMessage.error.error
              );
            }
        }
      )
  }

  public onSaveRoute(formRoute: NgForm): void {
    if(this.validate()) {
      if(this.route.rou_uuid && this.route.rou_uuid != 'new') {
        this.updateRoute(formRoute);
      } else {
        this.insertRoute(formRoute);
      }
    }
  }
}
