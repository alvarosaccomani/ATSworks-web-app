import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CompanyInterface } from '../../../core/interfaces/company';
import { CompaniesService } from '../../../core/services/companies.service';

declare var Swal: any;

@Component({
  selector: 'app-company-profile',
  imports: [
    FormsModule
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss'
})
export class CompanyProfileComponent {

  public company!: CompanyInterface;
  public isLoading: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _companiesService: CompaniesService
  ) {
    this.isLoading = false;
    this.companyInit();
  }

  ngOnInit(): void {
    this._route.params.subscribe( (params) => {
      if(params['cmp_uuid'] && params['cmp_uuid'] != 'new') {
        this.company.cmp_uuid = params['cmp_uuid'];
        this.getCompanyById(this.company.cmp_uuid!);
      }
    });
  }

  public companyInit(): void {
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
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }  

  private showMessage(title: string, text: string): void {
    Swal.fire({
        title: title,
        text: text,
        type: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
      }).then((result: any) => {
        console.info(result);
      });
  }

  private validate(): boolean {
    if(!this.company.cmp_name) {
      this.showMessage("Error", "El nombre de empresa no puede estar vacio");
      return false;
    }

    if(this.company.cmp_name.length > 150) {
      this.showMessage("Error", "El nombre no puede superar los 150 caracteres");
      return false;
    }

    if(this.company.cmp_phone && this.company.cmp_phone.length > 20) {
      this.showMessage("Error", "El telefono no puede superar los 20 caracteres");
      return false;
    }

    if(this.company.cmp_email && this.company.cmp_email.length > 100) {
      this.showMessage("Error", "El email no puede superar los 100 caracteres");
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

  private async insertCompany(formCompany: NgForm): Promise<void> {
    this.isLoading = true;
      this._companiesService.saveCompany(formCompany.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const company = response.company;
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
