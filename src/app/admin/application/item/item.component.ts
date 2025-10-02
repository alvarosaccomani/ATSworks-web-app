import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ItemInterface } from '../../../core/interfaces/item';
import { ItemsService } from '../../../core/services/items.service';

declare var Swal: any;

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

  public item!: ItemInterface;
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
    private _router: Router,
    private _route: ActivatedRoute,
    private _itemsService: ItemsService
  ) {
    this.isLoading = false;
    this.itemInit();
  }

  ngOnInit(): void {
    this._route.params.subscribe( (params) => {
      if(params['itm_uuid'] && params['itm_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR ITEM",
          description: "Ficha para actualizar un Rubro.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.item.itm_uuid = params['itm_uuid'];
        this.getItemById(params['itm_uuid']);
      } else {
        this.headerConfig = {
          title: "NUEVO ITEM",
          description: "Ficha para agregar un Rubro.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
  }

  public itemInit(): void {
    this.item = {
      itm_uuid: 'new',
      itm_name: null,
      itm_description: null,
      itm_createdat: null,
      itm_updatedat: null
    }   
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
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  private showMessage(title: string, text: string, callback?: () => void): void {
    Swal.fire({
        title: title,
        text: text,
        type: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
      }).then((result: any) => {
        console.info(result);
        // Ejecutar el callback si se proporciona
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
  }

  private validate(): boolean {
    if(!this.item.itm_name) {
      this.showMessage("Error", "El nombre del item no puede estar vacio");
      return false;
    }
    if(this.item.itm_name.length > 100) {
      this.showMessage("Error", "El nombre del item no puede superar los 100 caracteres");
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
          this.showMessage("Informacion", "El Rubro fue actualizado correctamente.", () => {
            this._router.navigate(['/admin/application/items']);
          });
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
              this.showMessage("Error", errorMessage.error.error);
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
          this.showMessage("Informacion", "El Rubro fue agregado correctamente.", () => {
            this._router.navigate(['/admin/application/items']);
          });
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

  public onSaveItem(formItem: NgForm): void {
    if(this.validate()) {
      if(this.item.itm_uuid && this.item.itm_uuid != 'new') {
        this.updateItem(formItem);
      } else {
        this.insertItem(formItem);
      }
    }
  }

}
