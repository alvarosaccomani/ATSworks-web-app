import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { CustomerInterface } from '../../../core/interfaces/customer';
import { AddressInterface } from '../../../core/interfaces/address/address.interface';
import { RouteInterface } from '../../../core/interfaces/route';
import { WorkResults } from '../../../core/interfaces/work';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { CustomersService } from '../../../core/services/customers.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { WorksService } from '../../../core/services/works.service';

@Component({
  selector: 'app-customer-works',
  imports: [
    FormsModule,
    AsyncPipe,
    DatePipe,
    RouterLink,
    NzIconModule,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './customer-works.component.html',
  styleUrl: './customer-works.component.scss'
})
export class CustomerWorksComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items
  
  public isLoadingCustomers: boolean = false;
  public isLoadingAddresses: boolean = false;

  // Variables para filtros
  public selectedCustomerUuid: string = "";
  public selectedAddressUuid: string = "";

  public fieldSortValue: string = "rou_order";
  public sortValue: string = "ASC";
  private cmp_uuid!: string;
  public customers: CustomerInterface[] = [];
  public addresses: AddressInterface[] = [];
  public routes: RouteInterface[] = [];
  public works$!: Observable<WorkResults>;

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
      icon: "fas fa-sort fa-fw",
      title: "TRABAJOS POR CLIENTE"
    }
  ]

  constructor(
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _customersService: CustomersService,
    private _addressesService: AddressesService,
    private _worksService: WorksService,
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getCustomers(this.cmp_uuid!);
  }

  private getCustomers(cmp_uuid: string) {
    this._customersService.getCustomers(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.isLoadingCustomers = false;
          this.customers = response.data;
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

  private getAdresses(cmp_uuid: string, cus_uuid: string) {
    this._addressesService.getAddresses(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.isLoadingAddresses = false;
          this.addresses = response.data;
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

  public onCustomerSelected(cus_uuid: string | null) {
    if(cus_uuid) {
      this.selectedCustomerUuid = cus_uuid;
      if (this.selectedCustomerUuid) {
        this.getAdresses(this.cmp_uuid!, this.selectedCustomerUuid);
      } else {
        this.selectedCustomerUuid = '';
      }
    }
  }

  public onAddressSelected(adr_uuid: string | null) {
    if(adr_uuid) {
      this.selectedAddressUuid = adr_uuid;
    }
  }

  private validate(): boolean {
    if(!this.selectedCustomerUuid) {
      this._messageService.error(
        "Error", 
        "Debe seleccionar un cliente."
      );
      return false;
    }
    if(!this.selectedAddressUuid) {
      this._messageService.error(
        "Error", 
        "Debe seleccionar una dirección."
      );
      return false;
    }

    return true;
  }

  public filter(): void {
    if(this.validate()) {
      this.works$ = this._worksService.getWorksByAddress(this.cmp_uuid, this.selectedCustomerUuid, this.selectedAddressUuid, this.page, this.perPage, this.fieldSortValue, this.sortValue);
    }
  }

  public clearSearch(): void {
    this.selectedCustomerUuid = "";
    this.selectedAddressUuid = "";
  }

  public goToPage(page: number): void {
    this.page = page;
    this.works$ = this._worksService.getWorksByAddress(this.cmp_uuid, this.selectedCustomerUuid, this.selectedAddressUuid, this.page, this.perPage, this.fieldSortValue, this.sortValue);
  }
}
