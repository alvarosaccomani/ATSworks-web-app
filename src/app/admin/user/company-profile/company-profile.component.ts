import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
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
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _companiesService: CompaniesService
  ) {
    this.isLoading = false;
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

  private validate(): boolean {
    if(!this.company.cmp_name) {
      this.status = 'error';
      this.errorMessage = "El nombre de empresa no puede estar vacio";
      return false;
    }

    return true;
  }

  private async updateCompany(formCompany: NgForm): Promise<void> {
    this.isLoading = true;
    this._companiesService.updateCompany(formCompany.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const company = response.company;
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

  private async insertCompany(formCompany: NgForm): Promise<void> {
    this.isLoading = true;
      this._companiesService.saveCompany(formCompany.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const company = response.company;
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

  public onSaveCompany(formCompany: NgForm): void {
    if(this.validate()) {
      if(this.company.cmp_uuid) {
        this.updateCompany(formCompany);
      } else {
        this.insertCompany(formCompany);
      }
    }
  }
}
