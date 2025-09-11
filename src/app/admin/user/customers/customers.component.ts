import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersService } from '../../../core/services/customers.service';
import { CustomerResults } from '../../../core/interfaces/customer';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-customers',
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {

  public customers$!: Observable<CustomerResults>;

  constructor(
    private _customersService: CustomersService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    let cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.customers$ = this._customersService.getCustomers(cmp_uuid);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.customers$ = this._customersService.getCustomers(company.cmp.cmp_uuid);
      }
    });
  }
}
