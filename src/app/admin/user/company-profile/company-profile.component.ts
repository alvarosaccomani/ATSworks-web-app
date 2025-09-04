import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyInterface } from '../../../core/interfaces/company';
import { CompaniesService } from '../../../core/services/companies.service';

@Component({
  selector: 'app-company-profile',
  imports: [
    FormsModule
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss'
})
export class CompanyProfileComponent {

  public company: CompanyInterface;

  constructor(
    private _route: ActivatedRoute,
    private _companiesService: CompaniesService
  )
  {
    this.company = {
      cmp_uuid: null,
      cmp_name: null,
      cmp_address: null,
      cmp_phone: null,
      cmp_email: null,
      cmp_createdat: null,
      cmp_updatedat: null
    }
  }

  ngOnInit(): void {
    this._route.params.subscribe( (params) => {
      if(params['cmp_uuid'] && params['cmp_uuid'] != 'new') {
        this.company.cmp_uuid = params['cmp_uuid'];
        this.getCompanyById(this.company.cmp_uuid!);
      }
    });
  }

  private getCompanyById(cmp_uuid: string): void {
    this._companiesService.getCompanyById(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.company = response.data;
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
