import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ItemInterface, ItemResults } from '../../../core/interfaces/item';
import { MessageService } from '../../../core/services/message.service';
import { ItemsService } from '../../../core/services/items.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-items',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  private cmp_uuid!: string;
  public items$!: Observable<ItemResults>;
  public headerConfig: any = {
    title: "LISTA DE ITEMS",
    description: "Listado de Rubros.",
    icon: "fas fa-clipboard-list fa-fw"
  }
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
      private _messageService: MessageService,
      private _itemsService: ItemsService
    ) { }
    
    ngOnInit(): void {
      this.items$ = this._itemsService.getItems("null", this.page, this.perPage);
  }

  public deleteItem(item: ItemInterface) {
    this._messageService.showCustomMessage({
        title: "¿Estás seguro de eliminar el Rubro?",
        type: "question",
        text: "Estás a punto de eliminar el Rubro.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._itemsService.deleteItem(item.itm_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.items$ = this._itemsService.getItems("null", this.page, this.perPage);
              },
              error => {
                console.log(<any>error);
              }
            );
        }
      }
    );
  }

  public goToPage(page: number): void {
    this.page = page;
    this.items$ = this._itemsService.getItems("null", page, this.perPage);
  }
}
