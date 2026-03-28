import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomersService } from '../../../core/services/customers.service';
import { RoutesService } from '../../../core/services/routes.service';
import { CustomerInterface, CustomerResults } from '../../../core/interfaces/customer';
import { RouteInterface } from '../../../core/interfaces/route';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-customers-order',
  imports: [
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent,
    NzIconModule,
    NzSelectModule
  ],
  templateUrl: './customers-order.component.html',
  styleUrl: './customers-order.component.scss'
})
export class CustomersOrderComponent implements OnInit {

  public customers: CustomerInterface[] = [];
  public routes: RouteInterface[] = [];
  public isLoading: boolean = false;
  public isLoadingRoutes: boolean = false;
  public searchRoute: string = '';
  private cmp_uuid!: string;

  public headerConfig: any = {
    title: "ORDEN DE CLIENTES",
    description: "Configurar el orden de los clientes.",
    icon: "fas fa-sort fa-fw"
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
    this.getCustomers();
    this.getRoutes(this.cmp_uuid);

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        this.cmp_uuid = company.cmp_uuid;
        this.getCustomers();
      }
    });
  }

  public getCustomers(): void {
    this.isLoading = true;
    // Pedimos una cantidad mayor para ordenar (ej: 100) y ordenamos por cus_order
    this._customersService.getCustomers(this.cmp_uuid, undefined, undefined, (this.searchRoute ? this.searchRoute : undefined), 1, 100, 'cus_order', 'ASC').subscribe(
      (response: CustomerResults) => {
        this.customers = response.data;
        this.isLoading = false;
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
      }
    );
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

  public onSaveOrder(): void {
    this.isLoading = true;
    let updatesCompleted = 0;
    const totalToUpdate = this.customers.length;

    if (totalToUpdate === 0) {
      this.isLoading = false;
      return;
    }

    this.customers.forEach(customer => {
      this._customersService.updateCustomer(customer).subscribe(
        response => {
          updatesCompleted++;
          if (updatesCompleted === totalToUpdate) {
            this.isLoading = false;
            this._messageService.success("Información", "El orden de los clientes ha sido actualizado.");
            this.getCustomers();
          }
        },
        error => {
          console.error(`Error updating customer ${customer.cus_uuid}`, error);
          updatesCompleted++;
          if (updatesCompleted === totalToUpdate) {
            this.isLoading = false;
            this._messageService.error("Error", "Ocurrió un error al actualizar algunos clientes.");
          }
        }
      );
    });
  }

  public moveUp(index: number): void {
    if (index > 0) {
      const temp = this.customers[index];
      this.customers[index] = this.customers[index - 1];
      this.customers[index - 1] = temp;
      this.reassignOrderValues();
    }
  }

  public moveDown(index: number): void {
    if (index < this.customers.length - 1) {
      const temp = this.customers[index];
      this.customers[index] = this.customers[index + 1];
      this.customers[index + 1] = temp;
      this.reassignOrderValues();
    }
  }

  private reassignOrderValues(): void {
    this.customers.forEach((customer, index) => {
      customer.cus_order = index + 1;
    });
  }
}
