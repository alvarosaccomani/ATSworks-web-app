import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersService } from '../../../core/services/customers.service';
import { CustomerResults } from '../../../core/interfaces/customer';

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
    private _customersService: CustomersService
  ) { }
  
  ngOnInit(): void {
    this.customers$ = this._customersService.getCustomers('');
  }
}
