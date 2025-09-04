import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ModelItemInterface } from '../../../core/interfaces/model-item';
import { ModelItemsService } from '../../../core/services/model-items.service';

@Component({
  selector: 'app-model-item',
  imports: [
    FormsModule
  ],
  templateUrl: './model-item.component.html',
  styleUrl: './model-item.component.scss'
})
export class ModelItemComponent {

    public modelItem: ModelItemInterface;
    public companyItems: any;
    public selectedcompanyItem: any;
    public status: string = "";
    public errorMessage: string = "";
    public isLoading: boolean = false;
    
      constructor(
        private _route: ActivatedRoute,
        private _modelsItemsService: ModelItemsService
      ) {
        this.isLoading = false;
        this.modelItem = {
          cmp_uuid: null,
          itm_uuid: null,
          cmpitm_uuid: null,
          mitm_uuid: 'new',
          mitm_name: null,
          mitm_description: null,
          mitm_active: null,
          mitm_createdat: null,
          mitm_updatedat: null
        }
      }

  ngOnInit(): void {
    this.modelItem.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    this.companyItems = JSON.parse(localStorage.getItem('companyItems')!);

    this._route.params.subscribe( (params) => {
      if(params['itm_uuid'] && params['cmpitm_uuid'] && params['mitm_uuid'] && params['mitm_uuid'] != 'new') {
        this.modelItem.itm_uuid = params['itm_uuid'];
        this.modelItem.cmpitm_uuid = params['cmpitm_uuid'];
        this.modelItem.mitm_uuid = params['mitm_uuid'];
        this.getModelItemById(this.modelItem.cmp_uuid!, this.modelItem.itm_uuid!, this.modelItem.cmpitm_uuid!, params['mitm_uuid']);
      }
    });
  }

  private getModelItemById(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string): void {
    this._modelsItemsService.getModelItemById(cmp_uuid, itm_uuid, cmpitm_uuid, mitm_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.modelItem = response.data;
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

  public onCompanyItemChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedItemCompany = this.companyItems.find(
      (companyItem: any) => companyItem.itm.itm_uuid === selectedValue
    );
    if (selectedItemCompany) {
      this.modelItem.itm_uuid = selectedItemCompany.itm_uuid;
      this.modelItem.cmpitm_uuid = selectedItemCompany.cmpitm_uuid;
    }
  }

  private validate(): boolean {
    if(!this.modelItem.mitm_name) {
      this.status = 'error';
      this.errorMessage = "El nombre de modelo de item no puede estar vacio";
      return false;
    }

    return true;
  }

  public onSaveModelItem(formModelItem: NgForm): void {
    if(this.validate()) {
      this.isLoading = true;
      this._modelsItemsService.saveModelItem(formModelItem.form.value).subscribe(
        response => {
          this.isLoading = false;
          const modelItem = response.modelItem;
          this.status = 'success';
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
  }

}
