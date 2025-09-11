import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ItemResults } from '../../../core/interfaces/item';
import { ItemsService } from '../../../core/services/items.service';

@Component({
  selector: 'app-items',
  imports: [
    AsyncPipe,
    RouterLink,
    PageNavTabsComponent
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {

  public items$!: Observable<ItemResults>;

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
      private _itemsService: ItemsService
    ) { }
    
    ngOnInit(): void {
      this.items$ = this._itemsService.getItems('');
    }

}
