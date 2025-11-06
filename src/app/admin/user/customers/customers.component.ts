import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomersService } from '../../../core/services/customers.service';
import { CustomerInterface, CustomerResults } from '../../../core/interfaces/customer';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-customers',
  imports: [
    AsyncPipe,
    RouterLink,
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

  private cmp_uuid!: string;
  public customers$!: Observable<CustomerResults>;
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
    }
  ]

  constructor(
    private _messageService: MessageService,
    private _customersService: CustomersService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    this.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.customers$ = this._customersService.getCustomers(this.cmp_uuid, "null", 1, 20);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.customers$ = this._customersService.getCustomers(company.cmp.cmp_uuid, "null", this.page, this.perPage);
      }
    });
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
                this.customers$ = this._customersService.getCustomers(customer.cmp_uuid!, "null", this.page, this.perPage);
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
    this.customers$ = this._customersService.getCustomers(this.cmp_uuid, "null", page, this.perPage);
  }
}
