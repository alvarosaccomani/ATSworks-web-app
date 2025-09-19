import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomerInterface } from '../../../core/interfaces/customer';
import { CustomersService } from '../../../core/services/customers.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-customer',
  imports: [
    RouterLink,
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

  public customer: CustomerInterface;
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;
  public headerConfig: any = {};
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
    private _route: ActivatedRoute,
    private _router: Router,
    private _customersService: CustomersService,
    private _addressesService: AddressesService,
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
        this.headerConfig = {
          title: "ACTUALIZAR CLIENTE",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.customer.cus_uuid = params['cus_uuid'];
        this.getCustomerById(this.customer.cmp_uuid!, params['cus_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR CLIENTE",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
          icon: "fas fa-plus fa-fw"
        }
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

  private getAdresses(cmp_uuid: string, cus_uuid: string) {
    this._addressesService.getAddresses(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.customer.addresses = response.data;
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

  private getCustomerById(cmp_uuid: string, cus_uuid: string): void {
    this._customersService.getCustomerById(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.customer = response.data;
          this.getAdresses(this.customer.cmp_uuid!, this.customer.cus_uuid!);
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

  public addAddress(): void {
    this._router.navigate(['/admin/user/address', 'new', '']);
  }

  private validate(): boolean {
    if(!this.customer.cus_fullname) {
      this.status = 'error';
      this.errorMessage = "El nombre de cliente no puede estar vacio";
      return false;
    }

    return true;
  }

  private async updateCustomer(formCustomer: NgForm): Promise<void> {
    this.isLoading = true;
    this._customersService.updateCustomer(formCustomer.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const customer = response.customer;
          this.status = 'success';
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private async insertCustomer(formCustomer: NgForm): Promise<void> {
    this.isLoading = true;
      this._customersService.saveCustomer(formCustomer.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const customer = response.customer;
            this.status = 'success';
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage!=null) {
                this.status = 'error';
                this.errorMessage = errorMessage.error.error;
            }
        }
      )
  }

  public onSaveCustomer(formCustomer: NgForm): void {
    if(this.validate()) {
      if(this.customer.cus_uuid) {
        this.updateCustomer(formCustomer);
      } else {
        this.insertCustomer(formCustomer);
      }
    }
  }
}
