import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { CustomerInterface } from '../../../core/interfaces/customer';
import { CollectionFormInterface } from '../../../core/interfaces/collection-form';
import { CustomersService } from '../../../core/services/customers.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { CollectionFormsService } from '../../../core/services/collection-forms.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { AddressInterface } from '../../../core/interfaces/address';

declare var Swal: any;

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

  public customer!: CustomerInterface;
  public collectionForms: CollectionFormInterface[] = [];
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
    private _collectionFormsService: CollectionFormsService,
    private _sharedDataService: SharedDataService
  ) {
    this.isLoading = false;
    this.customerInit();
  }

  ngOnInit(): void {
    this.customer.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    this.getCollectionForms(this.customer.cmp_uuid!);

    this._route.params.subscribe( (params) => {
      if(params['cus_uuid'] && params['cus_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR CLIENTE",
          description: "Ficha para actualizar un Cliente.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.customer.cus_uuid = params['cus_uuid'];
        this.getCustomerById(this.customer.cmp_uuid!, params['cus_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR CLIENTE",
          description: "Ficha para agregar un Cliente.",
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

  public customerInit(): void {
    this.customer = {
      cmp_uuid: null,
      cus_uuid: 'new',
      cus_fullname: null,
      cus_email: null,
      cus_phone: null,
      cus_dateofbirth: null,
      cfrm_uuid: null,
      usr_uuid: null,
      cus_createdat: null,
      cus_updatedat: null
    }
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
        let errorMessage = <any>error;
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
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }
  
  private getCollectionForms(cmp_uuid: string) {
    this._collectionFormsService.getCollectionForms(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.collectionForms = response.data;
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

  public addAddress(): void {
    this._router.navigate(['/admin/user/address', 'new', '']);
  }

  public onCollectionFormChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedCollectionForm = this.collectionForms.find(
      (selectedCollectionForm: CollectionFormInterface) => selectedCollectionForm.cfrm_uuid === selectedValue
    );
    if (selectedCollectionForm) {
      //this.setModelItem(selectedCollectionForm);
    }
  }

  private showMessage(title: string, text: string, callback?: () => void): void {
    Swal.fire({
        title: title,
        text: text,
        type: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
      }).then((result: any) => {
        console.info(result);
        // Ejecutar el callback si se proporciona
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
  }

  private validate(): boolean {
    if(!this.customer.cus_fullname) {
      this.showMessage("Error", "El nombre de cliente no puede estar vacio");
      return false;
    }

    if(this.customer.cus_fullname.length > 255) {
      this.showMessage("Error", "El nombre no puede superar los 255 caracteres");
      return false;
    }

    if(this.customer.cus_email && this.customer.cus_email.length > 255) {
      this.showMessage("Error", "El email no puede superar los 255 caracteres");
      return false;
    }

    if(this.customer.cus_phone && this.customer.cus_phone.length > 20) {
      this.showMessage("Error", "El telefono no puede superar los 20 caracteres");
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
          this.showMessage("Informacion", "El Cliente fue actualizado correctamente.", () => {
            this._router.navigate(['/admin/user/customers']);
          });
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

  private async insertCustomer(formCustomer: NgForm): Promise<void> {
    this.isLoading = true;
      this._customersService.saveCustomer(formCustomer.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const customer = response.customer;
            this.showMessage("Informacion", "El Cliente fue agregado correctamente.", () => {
              this._router.navigate(['/admin/user/customers']);
            });
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
                this.showMessage("Error", errorMessage.error.error);
            }
        }
      )
  }

  public onSaveCustomer(formCustomer: NgForm): void {
    if(this.validate()) {
      if(this.customer.cus_uuid && this.customer.cus_uuid != 'new') {
        this.updateCustomer(formCustomer);
      } else {
        this.insertCustomer(formCustomer);
      }
    }
  }

  public deleteAddress(address: AddressInterface) {
    Swal.fire({
        title: '¿Desea eliminar la Direccion?',
        text: "Esta a punto de eliminar la Direccion",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'No, cancelar'
      }).then((result: any) => {
        if (result.value) {
          this._addressesService.deleteAddress(address.cmp_uuid!, address.cus_uuid!, address.adr_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.getAdresses(address.cmp_uuid!, address.cus_uuid!);
              },
              error => {
                console.log(<any>error);
              }
            );
        }
      });
  }
}
