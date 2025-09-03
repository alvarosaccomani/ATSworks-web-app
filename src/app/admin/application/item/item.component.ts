import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ItemInterface } from '../../../core/interfaces/item';
import { ItemsService } from '../../../core/services/items.service';

@Component({
  selector: 'app-item',
  imports: [
    FormsModule
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent {

  public item: ItemInterface;
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _itemsService: ItemsService
  ) {
    this.isLoading = false;
    this.item = {
      itm_uuid: 'new',
      itm_name: null,
      itm_description: null,
      itm_createdat: null,
      itm_updatedat: null
    }    
  }

  ngOnInit(): void {
    this._route.params.subscribe( (params) => {
      if(params['itm_uuid'] && params['itm_uuid'] != 'new') {
        this.item.itm_uuid = params['itm_uuid'];
        this.getItemById(params['itm_uuid']);
      }
    });
  }

  private getItemById(itm_uuid: string): void {
    this._itemsService.getItemById(itm_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.item = response.data;
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
    if(!this.item.itm_name) {
      this.status = 'error';
      this.errorMessage = "El nombre del item no puede estar vacio";
      return false;
    }

    return true;
  }

  public onSaveItem(formRegister: NgForm): void {
    if(this.validate()) {
      this.isLoading = true;
      this._itemsService.saveItem(formRegister.form.value).subscribe(
        response => {
          this.isLoading = false;
          const item = response.item;
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
