import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { CustomerInterface } from '../../core/interfaces/customer';
import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { WorkResults } from '../../core/interfaces/work';

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

import { SessionService } from '../../core/services/session.service';
import { CustomersService } from '../../core/services/customers.service';
import { AddressesService } from '../../core/services/addresses.service';
import { WorksService } from '../../core/services/works.service';

@Component({
  selector: 'app-customer-works',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    DatePipe,
    RouterLink,
    NzIconModule,
    NzSelectModule,
    NzEmptyModule,
    NzToolTipModule,
    PaginationComponent
  ],
  templateUrl: './customer-works.component.html',
  styleUrl: './customer-works.component.scss'
})
export class CustomerWorksComponent implements OnInit {

  public page: number = 1;
  public perPage: number = 10;
  public numElements!: number;
  
  public isLoading: boolean = true;
  public customer: CustomerInterface | undefined;
  public addresses: AddressInterface[] = [];
  public works$!: Observable<WorkResults>;

  // Filtros
  public selectedAddressUuid: string = "";
  public sortValue: string = "DESC"; // Por defecto los más recientes primero

  private cmp_uuid!: string;
  private usr_uuid!: string;

  constructor(
    private _sessionService: SessionService,
    private _customersService: CustomersService,
    private _addressesService: AddressesService,
    private _worksService: WorksService,
  ) { }

  ngOnInit(): void {
    const identity = this._sessionService.getIdentity();
    const company = this._sessionService.getCompany();
    
    if (identity && company) {
      this.cmp_uuid = company.cmp_uuid;
      this.usr_uuid = identity.usr_uuid;
      this.loadCustomerData();
    }
  }

  private loadCustomerData() {
    this.isLoading = true;
    this._customersService.getCustomerByUserId(this.cmp_uuid, this.usr_uuid).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.customer = response.data;
          this.loadAddresses();
        } else {
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error fetching customer data:', error);
        this.isLoading = false;
      }
    );
  }

  private loadAddresses() {
    if (!this.customer?.cus_uuid) return;
    
    this._addressesService.getAddresses(this.cmp_uuid, this.customer.cus_uuid).subscribe(
      (response: any) => {
        if (response.success && response.data.length > 0) {
          this.addresses = response.data;
          // Si hay direcciones, seleccionamos la primera por defecto
          this.selectedAddressUuid = this.addresses[0].adr_uuid!;
          this.loadWorks();
        } else {
          this.addresses = [];
          this.selectedAddressUuid = "";
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error fetching addresses:', error);
        this.isLoading = false;
      }
    );
  }

  public loadWorks() {
    if (!this.customer?.cus_uuid) return;
    
    this.isLoading = true;
    this.works$ = this._worksService.getWorksByAddress(
      this.cmp_uuid, 
      this.customer.cus_uuid, 
      this.selectedAddressUuid || undefined, 
      this.page, 
      this.perPage, 
      'wrk_workdate', 
      this.sortValue
    );
    
    this.works$.subscribe(
        res => {
            this.numElements = res.numElements || 0;
            this.isLoading = false;
        },
        err => this.isLoading = false
    );
  }

  public onAddressChange(adr_uuid: string) {
    this.selectedAddressUuid = adr_uuid;
    this.page = 1;
    this.loadWorks();
  }

  public goToPage(page: number): void {
    this.page = page;
    this.loadWorks();
  }
}
