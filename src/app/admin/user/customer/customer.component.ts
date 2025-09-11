import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomerInterface } from '../../../core/interfaces/customer';
import { CustomersService } from '../../../core/services/customers.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-customer',
  imports: [
    FormsModule,
    PageNavTabsComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

  public customer: CustomerInterface;
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
  public isLoading: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _customersService: CustomersService,
    private _sharedDataService: SharedDataService
  ) {
    this.isLoading = false;
    this.customer = {
      cmp_uuid: null,
      cus_uuid: 'new',
      cus_fullname: null,
      cus_email: null,
      cus_phone: null,    
      usr_uuid: null,
      cus_createdat: null,
      cus_updatedat: null
    }
  }

  ngOnInit(): void {
    this.customer.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this._route.params.subscribe( (params) => {
      if(params['cus_uuid'] && params['cus_uuid'] != 'new') {
        this.customer.cus_uuid = params['cus_uuid'];
        this.getCustomerById(this.customer.cmp_uuid!, params['cus_uuid']);
      }
    });

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.customer.cmp_uuid = company.cmp.cmp_uuid;
        this.getCustomerById(this.customer.cmp_uuid!, this.customer.cus_uuid!);
      }
    });
  }

  private getCustomerById(cmp_uuid: string, cus_uuid: string): void {
    this._customersService.getCustomerById(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.customer = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

}
