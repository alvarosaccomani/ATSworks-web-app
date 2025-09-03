import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemResults } from '../../../core/interfaces/item';
import { ItemsService } from '../../../core/services/items.service';

@Component({
  selector: 'app-items',
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {

  public items$!: Observable<ItemResults>;
  
    constructor(
      private _itemsService: ItemsService
    ) { }
    
    ngOnInit(): void {
      this.items$ = this._itemsService.getItems('');
    }

}
