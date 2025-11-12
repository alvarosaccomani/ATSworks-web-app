import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { ModelItemInterface, ModelItemResults } from '../../../core/interfaces/model-item';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-models-items',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './models-items.component.html',
  styleUrl: './models-items.component.scss'
})
export class ModelsItemsComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  private cmp_uuid!: string;
  public modelItems$!: Observable<ModelItemResults>;
  public headerConfig: any = {
    title: "LISTA DE MODELOS ITEMS",
    description: "Listado de Modelos de Rubros.",
    icon: "fas fa-clipboard-list fa-fw"
  }
  public dataTabs: any = [
    {
      url: ['/admin/user/model-item/new', '', ''],
      icon: "fas fa-plus fa-fw",
      title: "NUEVO MODELO ITEM"
    },
    {
       url: ['/admin/user/models-items'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE MODELOS ITEMS"
    }
  ]

  constructor(
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _modelItemsService: ModelItemsService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    this.modelItems$ = this._modelItemsService.getModelItems(this.cmp_uuid, "null", this.page, this.perPage);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.modelItems$ = this._modelItemsService.getModelItems(company.cmp_uuid, "null", this.page, this.perPage);
      }
    });
  }

  public deleteModelItem(modelItem: ModelItemInterface) {
    this._messageService.showCustomMessage({
        title: "¿Estás seguro de eliminar el Modelo de Rubro?",
        type: "question",
        text: "Estás a punto de eliminar el Modelo de Rubro.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._modelItemsService.deleteModelItem(modelItem.cmp_uuid!, modelItem.itm_uuid!, modelItem.cmpitm_uuid!, modelItem.mitm_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.modelItems$ = this._modelItemsService.getModelItems(modelItem.cmp_uuid!, "null", this.page, this.perPage);
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
    this.modelItems$ = this._modelItemsService.getModelItems(this.cmp_uuid, "null", page, this.perPage);
  }
}
