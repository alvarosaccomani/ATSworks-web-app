import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { AppMenusService } from '../../../core/services/app-menus.service';
import { MenuInterface, MenuResults } from '../../../core/interfaces/menu';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-menu-items',
  imports: [
    FormsModule,
    AsyncPipe,
    RouterLink,
    NzIconModule,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss'
})
export class MenuItemsComponent implements OnInit {

  //Pagination
  public page: number = 1;
  public perPage: number = 10;
  public numElements!: number;

  // Variables para filtros
  public searchTitle: string = "";
  public fieldSortValue: string = "mnu_order";
  public sortValue: string = "ASC";

  public menus$!: Observable<MenuResults>;
  
  public headerConfig: any = {
    title: "LISTA DE MENUS",
    description: "Listado de elementos de menú de la aplicación.",
    icon: "fas fa-compass fa-fw"
  }

  public dataTabs: any = [
    {
      url: ['/admin/application/menu-item', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR MENU"
    },
    {
      url: ['/admin/application/menu-items'],
      icon: "fas fa-clipboard-list fa-fw",
      title: "LISTA DE MENUS"
    }
  ]

  constructor(
    private _messageService: MessageService,
    private _appMenusService: AppMenusService
  ) { }

  ngOnInit(): void {
    this.loadMenus();
  }

  public loadMenus(pageNumber: number = this.page): void {
    this.menus$ = this._appMenusService.getMenus(
      this.searchTitle || undefined,
      pageNumber,
      this.perPage,
      this.fieldSortValue,
      this.sortValue
    );
  }

  public filter(): void {
    this.loadMenus(1);
  }

  public clearSearch(): void {
    this.searchTitle = "";
    this.loadMenus(1);
  }

  public deleteMenu(menu: MenuInterface) {
    this._messageService.showCustomMessage({
      title: "¿Estás seguro de eliminar el Menú?",
      type: "question",
      text: `Estás a punto de eliminar el menú: "${menu.mnu_title}".`,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "No, cancelar"
    },
      (result: any) => {
        if (result.value) {
          this._appMenusService.deleteMenu(menu.mnu_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.loadMenus();
              },
              error => {
                this._messageService.error("Error", error.error.error || "Ocurrió un error al eliminar el menú.");
              }
            );
        }
      }
    );
  }

  public goToPage(page: number): void {
    this.page = page;
    this.loadMenus(page);
  }
}
