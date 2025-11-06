import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AddressInterface } from '../../../core/interfaces/address';
import { MessageService } from '../../../core/services/message.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-address',
  imports: [
    FormsModule,
    HeaderComponent,
  ],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent {

  public address!: AddressInterface;
  public isLoading: boolean = false;
  public headerConfig: any = {};

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _messageService: MessageService,
    private _addressesService: AddressesService,
    private _sharedDataService: SharedDataService
  )
  {
    this.isLoading = false;
    this.addressInit();
  }

  ngOnInit(): void {
    this.address.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this._route.params.subscribe( (params) => {
      if(params['adr_uuid'] && params['adr_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR DIRECCION",
          description: "Ficha para actualizar una Direccion.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.address.cus_uuid = params['cus_uuid'];
        this.address.adr_uuid = params['adr_uuid'];
        this.getAddressById(this.address.cmp_uuid!, params['cus_uuid'], params['adr_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR DIRECCION",
          description: "Ficha para agregar una Direccion.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.address.cmp_uuid = company.cmp.cmp_uuid;
        this.getAddressById(this.address.cmp_uuid!, this.address.cus_uuid!, this.address.adr_uuid!);
      }
    });
  }

  public addressInit(): void {
    this.address = {
      cmp_uuid: null,
      adr_uuid: 'new',
      cus_uuid: null,
      cus: null,
      adr_address: null,
      adr_city: null,
      adr_province: null,
      adr_postalcode: null,
      adr_createdat: null,
      adr_updatedat: null
    }
  }

  private getAddressById(cmp_uuid: string, cus_uuid: string, adr_uuid: string): void {
    this._addressesService.getAddressById(cmp_uuid, cus_uuid, adr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.address = response.data;
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
    if(!this.address.adr_address) {
      this._messageService.error(
        "Error", 
        "El nombre de la direccion no puede estar vacio."
      );
      return false;
    }

    if(this.address.adr_city && this.address.adr_city.length > 100) {
      this._messageService.error(
        "Error", 
        "La ciudad no puede superar los 100 caracteres."
      );
      return false;
    }

    if(this.address.adr_province && this.address.adr_province.length > 100) {
      this._messageService.error(
        "Error", 
        "La provincia no puede superar los 100 caracteres."
      );
      return false;
    }
    
    if(this.address.adr_postalcode && this.address.adr_postalcode.length > 20) {
      this._messageService.error(
        "Error", 
        "El codigo postal no puede superar los 20 caracteres."
      );
      return false;
    }

    return true;
  }

  private async updateAddress(formAddress: NgForm): Promise<void> {
    this.isLoading = true;
    this._addressesService.updateAddress(formAddress.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const address = response.address;
          this._messageService.success(
            "Informacion", 
            "La direccion fue actualizada correctamente.",
            () => {
              this._router.navigate(['/admin/user/customer', address.cus_uuid]);
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
          this._messageService.error(
            "Error", 
            errorMessage.error.error
          );
        }
      }
    )
  }

  private async insertAddress(formAddress: NgForm): Promise<void> {
    this.isLoading = true;
      this._addressesService.saveAddress(formAddress.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const address = response.address;
            this._messageService.success(
              "Informacion", 
              "La direccion fue agregada correctamente.",
              () => {
                this._router.navigate(['/admin/user/customer', address.cus_uuid]);
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

  public onSaveAddress(formAddress: NgForm): void {
    if(this.validate()) {
      if(this.address.adr_uuid && this.address.adr_uuid != 'new') {
        this.updateAddress(formAddress);
      } else {
        this.insertAddress(formAddress);
      }
    }
  }
}
