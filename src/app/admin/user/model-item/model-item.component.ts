import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { pluck } from 'rxjs/operators';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ModelItemInterface } from '../../../core/interfaces/model-item';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { DataTypesService } from '../../../core/services/data-types.service';

@Component({
  selector: 'app-model-item',
  imports: [
    FormsModule,
    DynamicTableComponent
  ],
  templateUrl: './model-item.component.html',
  styleUrl: './model-item.component.scss'
})
export class ModelItemComponent {

  public modelItem: ModelItemInterface;
  public companyItems: any;
  public selectedcompanyItem: any;
  public status: string = "";
  public errorMessage: string = "";
  public isLoading: boolean = false;

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
    },
    { key: 'dmitm_description', caption: 'Descripcion', visible: true, width: '30%' },
    { key: 'dmitm_defaultvalue', caption: 'Valor por defecto', visible: true, width: '30%' },
    { key: 'dmitm_active', caption: 'Activo', visible: true, width: '30%', type: 'boolean'},
    { key: 'dmitm_createdat', caption: 'Fecha Alta', visible: true, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ },
    { key: 'dmitm_updatedat', caption: 'Fecha Modificacion', visible: true, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ }
  ];
    
  constructor(
    private _route: ActivatedRoute,
    private _modelsItemsService: ModelItemsService,
    private _dataTypesService: DataTypesService
  ) {
    this.isLoading = false;
    this.modelItem = {
      cmp_uuid: null,
      itm_uuid: null,
      cmpitm_uuid: null,
      mitm_uuid: 'new',
      mitm_name: null,
      mitm_description: null,
      mitm_active: null,
      mitm_createdat: null,
      mitm_updatedat: null
    }
  }

  ngOnInit(): void {
    this.modelItem.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    this.companyItems = JSON.parse(localStorage.getItem('companyItems')!);

    this._route.params.subscribe( (params) => {
      if(params['itm_uuid'] && params['cmpitm_uuid'] && params['mitm_uuid'] && params['mitm_uuid'] != 'new') {
        this.modelItem.itm_uuid = params['itm_uuid'];
        this.modelItem.cmpitm_uuid = params['cmpitm_uuid'];
        this.modelItem.mitm_uuid = params['mitm_uuid'];
        this.getModelItemById(this.modelItem.cmp_uuid!, this.modelItem.itm_uuid!, this.modelItem.cmpitm_uuid!, params['mitm_uuid']);
      }
    });
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
        var errorMessage = <any>error;
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
      this.status = 'error';
      this.errorMessage = "El nombre de modelo de item no puede estar vacio";
      return false;
    }

    return true;
  }

  public onSaveModelItem(formModelItem: NgForm): void {
    if(this.validate()) {
      this.isLoading = true;
      this._modelsItemsService.saveModelItem(formModelItem.form.value).subscribe(
        response => {
          this.isLoading = false;
          const modelItem = response.modelItem;
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
