import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { from, of } from 'rxjs';
import { mergeMap, toArray, catchError, pluck } from 'rxjs/operators';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ModelItemInterface } from '../../../core/interfaces/model-item';
import { DetailModelItemInterface } from '../../../core/interfaces/detail-model-item';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { DetailModelItemsService } from '../../../core/services/detail-model-items.service';
import { DataTypesService } from '../../../core/services/data-types.service';

@Component({
  selector: 'app-model-item',
  imports: [
    FormsModule,
    HeaderComponent,
    DynamicTableComponent,
    PageNavTabsComponent
  ],
  templateUrl: './model-item.component.html',
  styleUrl: './model-item.component.scss'
})
export class ModelItemComponent {

  public modelItem!: ModelItemInterface;
  public companyItems: any;
  public isLoading: boolean = false;
  public headerConfig: any = {};
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

  // Opciones externas pasadas a la tabla
  public tableColumns: any = [
    { key: 'cmp_uuid', caption: 'cmp_uuid', visible: false, width: '10%' },
    { key: 'itm_uuid', caption: 'itm_uuid', visible: false, width: '40%' },
    { key: 'cmpitm_uuid', caption: 'cmpitm_uuid', visible: false, width: '40%' },
    { key: 'mitm_uuid', caption: 'mitm_uuid', visible: false, width: '40%' },
    { key: 'dmitm_uuid', caption: 'dmitm_uuid', visible: false, width: '40%' },
    { key: 'dmitm_key', caption: 'Clave', visible: true, width: '20%', validations: [
      { type: 'required', message: 'La clave es requerida.' }
    ] },
    { key: 'dmitm_name', caption: 'Nombre', visible: true, width: '30%' },
    { key: 'dtp_uuid', caption: 'dtp_uuid', visible: false, width: '30%' },
    { key: 'dtp', caption: 'Data Type', visible: true, width: '30%', 
      template: `
        <div><strong>Código:</strong> {{ dtp.dtp_cod }}</div>
        <div><strong>Nombre:</strong> {{ dtp.dtp_name }}</div>
      `,
      isSelect: true, 
      linkedProperty: 'dtp_uuid',
      options: {
        data: () => this._dataTypesService.getDataTypes(null!, null!, null!).pipe(
            pluck('data')
          ), // Usa una Promise
          value: 'dtp_uuid',
          label: 'dtp_name'
      },
      // Le decimos que esta columna controla la visibilidad de otra
      visibilityTrigger: {
        targetColumnKey: 'dmitm_arrayvalues', // La columna que será afectada
        checkProperty: 'dtp_name', // Le decimos que compare usando el nombre
        showOnValue: 'Lista' // Ahora el valor es el nombre visible, no el UUID
      }
    },
    { key: 'dmitm_arrayvalues', caption: 'Valores', visible: true, width: '30%' },
    { key: 'dmitm_description', caption: 'Descripcion', visible: true, width: '30%' },
    { key: 'dmitm_defaultvalue', caption: 'Valor por defecto', visible: true, width: '30%' },
    { key: 'dmitm_order', caption: 'Orden', visible: true, width: '30%' },
    { key: 'dmitm_active', caption: 'Activo', visible: true, width: '30%', type: 'boolean'},
    { key: 'dmitm_createdat', caption: 'Fecha Alta', visible: true, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ },
    { key: 'dmitm_updatedat', caption: 'Fecha Modificacion', visible: true, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ }
  ];
    
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _modelsItemsService: ModelItemsService,
    private _detailModelItemsService: DetailModelItemsService,
    private _dataTypesService: DataTypesService
  ) {
    this.isLoading = false;
    this.modelItemInit();
  }

  ngOnInit(): void {
    this.modelItem.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.companyItems = this._sessionService.getCompanyItems();

    this._route.params.subscribe( (params) => {
      if(params['itm_uuid'] && params['cmpitm_uuid'] && params['mitm_uuid'] && params['mitm_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR MODELO ITEM",
          description: "Ficha para actualizar un Modelo de Rubro.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.modelItem.itm_uuid = params['itm_uuid'];
        this.modelItem.cmpitm_uuid = params['cmpitm_uuid'];
        this.modelItem.mitm_uuid = params['mitm_uuid'];
        this.getModelItemById(this.modelItem.cmp_uuid!, this.modelItem.itm_uuid!, this.modelItem.cmpitm_uuid!, params['mitm_uuid']);
      } else {
        this.headerConfig = {
          title: "NUEVO MODELO ITEM",
          description: "Ficha para agregar un Modelo de Rubro.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
  }

  public modelItemInit(): void {
    this.modelItem = {
      cmp_uuid: null,
      itm_uuid: null,
      cmpitm_uuid: null,
      mitm_uuid: 'new',
      mitm_name: null,
      mitm_description: null,
      mitm_active: null,
      mitm_createdat: null,
      mitm_updatedat: null,
      detailModelItems: []
    }
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
        let errorMessage = <any>error;
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
      this._messageService.error(
        "Error", 
        "El nombre de modelo de item no puede estar vacio."
      );
      return false;
    }

    if(this.modelItem.mitm_name.length > 50) {
      this._messageService.error(
        "Error", 
        "El nombre no puede superar los 50 caracteres."
      );
      return false;
    }

    return true;
  }

  private async updateModelItem(formModelItem: NgForm): Promise<void> {
    this.isLoading = true;
    if (this.modelItem.detailModelItems?.length) {
      this.modelItem.detailModelItems.forEach((e) => {
        e.cmp_uuid = this.modelItem.cmp_uuid;
        e.itm_uuid = this.modelItem.itm_uuid,
        e.cmpitm_uuid = this.modelItem.cmpitm_uuid,
        e.mitm_uuid = this.modelItem.mitm_uuid
      });
    };
    this._modelsItemsService.updateModelItem(this.modelItem).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const modelItem = response.data;
          this.onSaveDetailModelItems(modelItem.cmp_uuid, modelItem.itm_uuid, modelItem.cmpitm_uuid, modelItem.mitm_uuid);
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
          //this.status = 'error'
        }
      }
    )
  }

  private async insertModelIem(formModelItem: NgForm): Promise<void> {
    this.isLoading = true;
    if (this.modelItem.detailModelItems?.length) {
      this.modelItem.detailModelItems.forEach((e) => {
        e.cmp_uuid = this.modelItem.cmp_uuid;
        e.itm_uuid = this.modelItem.itm_uuid,
        e.cmpitm_uuid = this.modelItem.cmpitm_uuid,
        e.mitm_uuid = this.modelItem.mitm_uuid
      });
    };

    this._modelsItemsService.saveModelItem(this.modelItem).subscribe(
      response => {
        this.isLoading = false;
        const modelItem = response.data;
        this.isLoading = false;
        this._messageService.success(
          "Informacion", 
          "El Modelo de rubro fue agregado correctamente.",
          () => {
            this._router.navigate(['/admin/user/models-items']);
          }
        );
      },
      error =>{
          this.isLoading = false;
          let errorMessage = <any>error;
          console.log(errorMessage);
          if(errorMessage != null) {
            this._messageService.error(
              "Error", 
              errorMessage.error.error
            );
          }
      }
    )
  }

  public onSaveModelItem(formModelItem: NgForm): void {
    if(this.validate()) {
      if(this.modelItem.mitm_uuid && this.modelItem.mitm_uuid != 'new') {
        this.updateModelItem(formModelItem);
      } else {
        this.insertModelIem(formModelItem);
      }
    }
  }

  public onSaveDetailModelItems(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string): void {
  // Verificar si hay elementos en detailModelItems
  if (this.modelItem.detailModelItems?.length) {
    this.modelItem.detailModelItems.forEach((e) => {
      e.cmp_uuid = cmp_uuid;
      e.itm_uuid = itm_uuid,
      e.cmpitm_uuid = cmpitm_uuid,
      e.mitm_uuid = mitm_uuid
    });
    // Convertir el array en un observable
    from(this.modelItem.detailModelItems)
      .pipe(
        // Procesar cada elemento del array
        mergeMap((detailModelItem: DetailModelItemInterface) => {
          // Si es un nuevo registro, asignar la fecha de creación
          if (detailModelItem.dmitm_createdat === null) {
            detailModelItem.dmitm_createdat = new Date();
          }

          // Determinar si es una inserción o una actualización
          if (!detailModelItem.dmitm_uuid) {
            // Inserción
            return this._detailModelItemsService.insertDetailModelItem(detailModelItem).pipe(
              catchError((error) => {
                console.error('Error al insertar:', error);
                return of(null); // Devolver un Observable vacío en caso de error
              })
            );
          } else {
            // Actualización 
            return this._detailModelItemsService.updateDetailModelItem(detailModelItem).pipe(
              catchError((error) => {
                console.error('Error al actualizar:', error);
                return of(null); // Devolver un Observable vacío en caso de error
              })
            );
            return of(null); // Devolver un Observable vacío si no hay actualización
          }
        }),
        // Agrupar todas las respuestas en un solo array
        toArray()
      )
      .subscribe({
        next: (responses) => {
          console.log('Respuestas de las llamadas:', responses);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al procesar las llamadas:', error);
        },
        complete: () => {
          this.isLoading = false;
          console.log('Proceso completado.');
          this._messageService.success(
            "Informacion", 
            "El Modelo de rubro fue agregado/modificado correctamente.",
            () => {
              this._router.navigate(['/admin/user/models-items']);
            }
          );
        }
      });
  } else {
    console.warn('No hay elementos en detailModelItems para procesar.');
    this.isLoading = false;
  }
}

}
