import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomersService } from '../../../core/services/customers.service';
import { RoutesService } from '../../../core/services/routes.service';
import { CustomerInterface, CustomerResults } from '../../../core/interfaces/customer';
import { RouteInterface } from '../../../core/interfaces/route';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-customers',
  imports: [
    FormsModule,
    AsyncPipe,
    RouterLink,
    NzIconModule,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  public isLoadingRoutes: boolean = false;

  // Variables para filtros
  public searchNombreApellido: string = "";
  public searchEmail: string = "";
  public searchRoute: string = '';
  public fieldSortValue: string = "rou_order";
  public sortValue: string = "ASC";

  private cmp_uuid!: string;
  public customers$!: Observable<CustomerResults>;
  public routes: RouteInterface[] = [];
  public headerConfig: any = {
    title: "LISTA DE CLIENTES",
    description: "Listado de Clientes.",
    icon: "fas fa-clipboard-list fa-fw"
  }
  public dataTabs: any = [
    {
      url: ['/admin/user/customer', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR CLIENTE"
    },
    {
      url: ['/admin/user/customers'],
      icon: "fas fa-clipboard-list fa-fw",
      title: "LISTA DE CLIENTES"
    },
    {
      url: ['/admin/user/customers-order'],
      icon: "fas fa-sort fa-fw",
      title: "ORDEN DE CLIENTES"
    },
    {
      url: ['/admin/user/customer-works'],
      icon: "fas fa-briefcase fa-fw",
      title: "TRABAJOS POR CLIENTE"
    }
  ]

  constructor(
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _customersService: CustomersService,
    private _routesService: RoutesService,
    private _sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this.customers$ = this._customersService.getCustomers(this.cmp_uuid, this.searchNombreApellido, this.searchEmail, this.searchRoute, 1, 20, this.fieldSortValue, this.sortValue);
    this.getRoutes(this.cmp_uuid);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.customers$ = this._customersService.getCustomers(company.cmp_uuid, this.searchNombreApellido, this.searchEmail, this.searchRoute, this.page, this.perPage, this.fieldSortValue, this.sortValue);
      }
    });
  }

  public filter(): void {
    this.customers$ = this._customersService.getCustomers(this.cmp_uuid, this.searchNombreApellido, this.searchEmail, this.searchRoute, this.page, this.perPage, this.fieldSortValue, this.sortValue);
  }

  public clearSearch(): void {
    this.searchNombreApellido = '';
    this.searchEmail = '';
  }

  private getRoutes(cmp_uuid: string) {
    this._routesService.getRoutes(cmp_uuid).subscribe(
      (response: any) => {
        if (response.success) {
          console.info(response.data);
          this.routes = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public deleteCustomer(customer: CustomerInterface) {
    this._messageService.showCustomMessage({
      title: "¿Estás seguro de eliminar el Cliente?",
      type: "question",
      text: "Estás a punto de eliminar el Cliente.",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "No, cancelar"
    },
      (result: any) => {
        if (result.value) {
          this._customersService.deleteCustomer(customer.cmp_uuid!, customer.cus_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.customers$ = this._customersService.getCustomers(customer.cmp_uuid!, this.searchNombreApellido, this.searchEmail, this.searchRoute, this.page, this.perPage, this.fieldSortValue, this.sortValue);
              },
              error => {
                this._messageService.error("Error", error.error.error || "Ocurrió un error al eliminar el cliente.");
              }
            );
        }
      }
    );
  }

  public goToPage(page: number): void {
    this.page = page;
    this.customers$ = this._customersService.getCustomers(this.cmp_uuid, this.searchNombreApellido, this.searchEmail, this.searchRoute, page, this.perPage, this.fieldSortValue, this.sortValue);
  }
}
