import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ItemInterface } from '../../../core/interfaces/item';
import { ItemsService } from '../../../core/services/items.service';

@Component({
  selector: 'app-item',
  imports: [
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent {

  public item: ItemInterface;
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;
  public headerConfig: any = {};
  public dataTabs: any = [
    {
      url: ['/admin/application/item', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "NUEVO ITEM"
    },
    {
       url: ['/admin/application/items'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE ITEMS"
    }
  ] 

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
        this.headerConfig = {
          title: "ACTUALIZAR ITEM",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.item.itm_uuid = params['itm_uuid'];
        this.getItemById(params['itm_uuid']);
      } else {
        this.headerConfig = {
          title: "NUEVO ITEM",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
          icon: "fas fa-plus fa-fw"
        }
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

  private async updateItem(formItem: NgForm): Promise<void> {
    this.isLoading = true;
    this._itemsService.updateItem(formItem.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const item = response.item;
          this.status = 'success';
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
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

  private async insertItem(formItem: NgForm): Promise<void> {
    this.isLoading = true;
    this._itemsService.saveItem(formItem.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const item = response.item;
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

  public onSaveItem(formItem: NgForm): void {
    if(this.validate()) {
      if(this.item.itm_uuid) {
        this.updateItem(formItem);
      } else {
        this.insertItem(formItem);
      }
    }
  }

}
