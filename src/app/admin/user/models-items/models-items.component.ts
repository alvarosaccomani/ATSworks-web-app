import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { ModelItemInterface, ModelItemResults } from '../../../core/interfaces/model-item';
import { SharedDataService } from '../../../core/services/shared-data.service';

declare var Swal: any;

@Component({
  selector: 'app-models-items',
  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    PageNavTabsComponent
  ],
  templateUrl: './models-items.component.html',
  styleUrl: './models-items.component.scss'
})
export class ModelsItemsComponent {

  public modelItems$!: Observable<ModelItemResults>;
  public headerConfig: any = {
    title: "LISTA DE MODELOS ITEMS",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
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
    private _modelItemsService: ModelItemsService,
    private _sharedDataService: SharedDataService
  ) { }
  
  ngOnInit(): void {
    let cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.modelItems$ = this._modelItemsService.getModelItems(cmp_uuid);
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.modelItems$ = this._modelItemsService.getModelItems(company.cmp.cmp_uuid);
      }
    });
  }

  public deleteModelItem(modelItem: ModelItemInterface) {
    Swal.fire({
        title: '¿Desea eliminar el Modelo de Item?',
        text: "You are about to close the session and exit the system",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'No, cancelar'
      }).then((result: any) => {
        if (result.value) {
          this._modelItemsService.deleteModelItem(modelItem.cmp_uuid!, modelItem.itm_uuid!, modelItem.cmpitm_uuid!, modelItem.mitm_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.modelItems$ = this._modelItemsService.getModelItems(modelItem.cmp_uuid!);
              },
              error => {
                console.log(<any>error);
              }
            );
        }
      });
  }
}
