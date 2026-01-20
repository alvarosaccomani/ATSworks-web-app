import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTransferModule, TransferChange, TransferItem, TransferSelectChange } from 'ng-zorro-antd/transfer';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { ModelItemInterface } from '../../../core/interfaces/model-item';
import { DetailModelItemInterface } from '../../../core/interfaces/detail-model-item';
import { RouteInterface } from '../../../core/interfaces/route';
import { AddressInterface } from '../../../core/interfaces/address/address.interface';
import { UserRolCompanyInterface } from '../../../core/interfaces/user-rol-company';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { RoutesService } from '../../../core/services/routes.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { WorksService } from '../../../core/services/works.service';

@Component({
  selector: 'app-massive-works',
  imports: [
    FormsModule,
    NzIconModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
    NzTransferModule,
    NzProgressModule,
    HeaderComponent,
    DynamicTableComponent,
    PageNavTabsComponent
  ],
  templateUrl: './massive-works.component.html',
  styleUrl: './massive-works.component.scss'
})
export class MassiveWorksComponent {

  public work!: WorkInterface;
  public modelItems: ModelItemInterface[] = [];
  public modelItem!: ModelItemInterface;
  public routes: RouteInterface[] = [];
  public routeName: string | null = '';
  public addresses: AddressInterface[] = [];
  public usersOperatorWork: UserRolCompanyInterface[] = [];
  //TODO: Ver
  public isLoadingRoutes: boolean = false;
  public isLoading: boolean = false;
  public headerConfig: any = {};
  public dataTabs: any = [
    {
      url: ['/admin/user/work','new'],
      icon: "fas fa-plus fa-fw",
      title: "NUEVO TRABAJO"
    },
    {
       url: ['/admin/user/works'],
       icon: "fas fa-clipboard-list fa-fw",
       title: "LISTA DE TRABAJOS"
    },
    {
       url: ['/admin/user/pending-works'],
       icon: "fas fa-hand-holding-usd fa-fw",
       title: "TRABAJOS PENDIENTES"
    },
    {
       url: ['/admin/user/work-schedule'],
       icon: "fas fa-calendar fa-fw",
       title: "CALENDARIO DE TRABAJOS"
    }
  ]

  public selectedCustomers: any[] = [];
  public progress = 0;          // % completado (0 a 100)
  public isSavingBatch = false; // estado general
  public totalAddresses = 0;
  public currentAddressIndex = 0;
  public list: TransferItem[] = [];
  public currentCustomerName: string | null = null;
  public $asTransferItems = (data: unknown): TransferItem[] => data as TransferItem[];

  // Opciones externas pasadas a la tabla
  public tableColumns: any = [
    { key: 'cmp_uuid', caption: 'cmp_uuid', visible: false, width: '10%' },
    { key: 'wrk_uuid', caption: 'wrk_uuid', visible: false, width: '40%' },
    { key: 'wrkd_uuid', caption: 'wrk_uuid', visible: false, width: '40%' },
    { key: 'wrkd_key', caption: 'Clave', visible: true, width: '20%', validations: [
      { type: 'required', message: 'La clave es requerida.' }
    ] },
    { key: 'wrkd_name', caption: 'Nombre', visible: true, width: '30%' },
    { key: 'wrkd_description', caption: 'Descripcion', visible: true, width: '30%' },
    { key: 'dtp_uuid: e.dtp_uuid', caption: 'dtp_uuid', visible: false, width: '30%' },
    { key: 'wrkd_value', caption: 'Valor', visible: true, width: '30%' },
    { key: 'wrkd_order', caption: 'Orden', visible: true, width: '30%' },
    { key: 'wrkd_createdat', caption: 'Fecha Alta', visible: false, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ },
    { key: 'wrkd_updatedat', caption: 'Fecha Modificacion', visible: false, width: '30%', type: 'date', defaultValue: (formatDate: (date: Date) => string) => formatDate(new Date()) /* Usa la función externa*/ }
  ];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _modelsItemsService: ModelItemsService,
    private _routesService: RoutesService,
    private _addressesService: AddressesService,
    private _worksService: WorksService,
    private _userRolesCompanyService: UserRolesCompanyService
  )
  {
    this.workInit();
  }
  
  ngOnInit(): void {
    this.work.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.work.wrk_user_uuid = this._sessionService.getIdentity().usr_uuid;
    this.getModelItems(this.work.cmp_uuid!);
    this.getRoutes(this.work.cmp_uuid!);
    this.getAddressesWithClient(this.work.cmp_uuid!, null);
    this.getUsersOperatorWork(this.work.cmp_uuid!);

    this.headerConfig = {
      title: "NUEVO TRABAJO",
      description: "Ficha para agregar un Trabajo.",
      icon: "fas fa-plus fa-fw"
    }
  }

  // GETTER: Transforma el objeto Date a String "YYYY-MM-DD" para que el input lo lea
  get workDateProxy(): string {
    if (!this.work.wrk_workdate) return '';
    
    // Convertimos la fecha a formato local YYYY-MM-DD
    const date = new Date(this.work.wrk_workdate);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    
    return `${year}-${month}-${day}`;
  }

  // SETTER: Recibe el String del input y lo convierte a objeto Date para tu interfaz
  set workDateProxy(value: string) {
    if (value) {
      // Creamos la fecha añadiendo la hora para asegurar que sea la fecha local correcta
      // Truco: agregar 'T00:00:00' fuerza la interpretación local en la mayoría de navegadores
      // o usar split para construirla manualmente es lo más seguro.
      const parts = value.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11
      const day = parseInt(parts[2], 10);
      
      this.work.wrk_workdate = new Date(year, month, day);
    } else {
      this.work.wrk_workdate = null;
    }
  }

  public workInit(): void {
    this.work = {
      cmp_uuid: null,
      wrk_uuid: 'new',
      adr_uuid: null,
      adr: null,
      wrk_description: null,
      wrk_workdate: new Date(),
      wrk_workdateinit: null,
      wrk_workdatefinish: null,
      wrks_uuid: 'bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823',
      wrks: null,
      wrk_user_uuid: null,
      wrk_user: null,
      wrk_operator_uuid1: null,
      wrk_operator1: null,
      wrk_operator_uuid2: null,
      wrk_operator2: null,
      wrk_operator_uuid3: null,
      wrk_operator3: null,
      wrk_operator_uuid4: null,
      wrk_operator4: null,
      wrk_customer: null,
      wrk_address: null,
      wrk_coordinates: null,
      wrk_phone: null,
      twrk_uuid: '96c9c123-721d-4cd8-8d2a-f66c111dc3c1',
      wrk_route: null,
      itm_uuid: null,
      cmpitm_uuid: null,
      mitm_uuid: null,
      mitm: null,
      wrk_createdat: null,
      wrk_updatedat: null
    }
  }

  private getModelItems(cmp_uuid: string) {
    this._modelsItemsService.getModelItems(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.modelItems = response.data;
          if(this.modelItems.length === 1 && this.work.wrk_uuid === "new") {
            let modelItem = this.modelItems[0];
            this.work.mitm_uuid = modelItem.mitm_uuid;
            this.setModelItem(modelItem);
          }
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
  
  private getModelItemById(cmp_uuid: string, itm_uuid: string, cmpitm_uuid: string, mitm_uuid: string) {
    this._modelsItemsService.getModelItemById(cmp_uuid, itm_uuid, cmpitm_uuid, mitm_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.modelItem = response.data;
          this.work.workDetails = this.modelItem.detailModelItems?.map((e: DetailModelItemInterface) => {
            return {
              cmp_uuid: e.cmp_uuid,
              wrk_uuid: this.work.wrk_uuid,
              wrkd_uuid: null,
              wrkd_key: e.dmitm_key,
              wrkd_name: e.dmitm_name,
              wrkd_description: null,
              dtp_uuid: e.dtp_uuid,
              wrkd_value: e.dmitm_defaultvalue,
              wrkd_order: e.dmitm_order,
              wrkd_groupkey: (e.gdmitm ? e.gdmitm?.gdmitm_key : null),
              wrkd_worker: null,
              wrkd_createdat: null,
              wrkd_updatedat: null
            }
          })
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

  private getRoutes(cmp_uuid: string) {
    this._routesService.getRoutes(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.isLoadingRoutes = false;
          this.routes = response.data;
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

  private getAddressesWithClient(cmp_uuid: string, rou_uuid: string | null) {
    this._addressesService.getAddressesWithClient(cmp_uuid, rou_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.addresses = response.data;
          this.list = this.addresses.map(item => {
            const routeName = item.cus?.rou?.rou_name || 'Sin ruta';
            return {
              key: item.adr_uuid,
              title: item.cus?.cus_fullname || '',
              description: item.adr_address || '',
              tag: routeName,
              disabled: !item.adr_active // opcional: deshabilitar si está inactivo
            } as TransferItem;
          });
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

  private getUsersOperatorWork(cmp_uuid: string) {
    this._userRolesCompanyService.getUserRolesCompany(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.usersOperatorWork = response.data;
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

  public setModelItem(modelItem: ModelItemInterface) {
    this.work.itm_uuid = modelItem.itm_uuid;
    this.work.cmpitm_uuid = modelItem.cmpitm_uuid;
    this.work.mitm_uuid = modelItem.mitm_uuid;
    this.getModelItemById(this.work.cmp_uuid!, this.work.itm_uuid!, this.work.cmpitm_uuid!, this.work.mitm_uuid!);
  }

  public onModelItemChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedModelItem = this.modelItems.find(
      (modelItem: ModelItemInterface) => modelItem.mitm_uuid === selectedValue
    );
    if (selectedModelItem) {
      this.setModelItem(selectedModelItem);
    }
  }

  public onRouteChange(event: string): void {
    this.getAddressesWithClient(this.work.cmp_uuid!, event);
  }

  public onWorkOperator1Change(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedOperator = this.usersOperatorWork.find(
      (operator: UserRolCompanyInterface) => operator.usr_uuid === selectedValue
    );
    if (selectedOperator) {
      this.work.wrk_operator_uuid1 = selectedOperator.usr_uuid;
    }
  }

  public onWorkOperator2Change(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedOperator = this.usersOperatorWork.find(
      (operator: UserRolCompanyInterface) => operator.usr_uuid === selectedValue
    );
    if (selectedOperator) {
      this.work.wrk_operator_uuid2 = selectedOperator.usr_uuid;
    }
  }

  public onWorkOperator3Change(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedOperator = this.usersOperatorWork.find(
      (operator: UserRolCompanyInterface) => operator.usr_uuid === selectedValue
    );
    if (selectedOperator) {
      this.work.wrk_operator_uuid3 = selectedOperator.usr_uuid;
    }
  }

  public onWorkOperator4Change(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedOperator = this.usersOperatorWork.find(
      (operator: UserRolCompanyInterface) => operator.usr_uuid === selectedValue
    );
    if (selectedOperator) {
      this.work.wrk_operator_uuid4 = selectedOperator.usr_uuid;
    }
  }

  public filterOption (inputValue: string, item: TransferItem): boolean {
    // Asegúrate de que 'title' exista y conviértelo a minúsculas
    const title = (item.title || '').toLowerCase();
    const description = (item['description'] || '').toLowerCase();
    const tag = (item['tag'] || '').toLowerCase(); // si usas tag en la búsqueda

    const search = inputValue.toLowerCase();

    return (
      title.includes(search) ||
      description.includes(search) ||
      tag.includes(search)
    );
  };

  public select(ret: TransferSelectChange): void {
    console.log('nzSelectChange', ret);
  }

  public onTransferChange(result: TransferChange): void {
    this.selectedCustomers = result.list;
    const selectedUuids = this.selectedCustomers.map(item => item.key);
    console.log('UUIDs seleccionados:', selectedUuids);
  }

  private validate(): boolean {
    if(!this.work.mitm_uuid) {
      this._messageService.error(
        "Error", 
        "Debe seleccionar un modelo de rubro."
      );
      return false;
    }

    if(this.work.wrk_workdate && new Date(this.work.wrk_workdate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      this._messageService.error(
        "Error", 
        "La fecha no puede ser inferior a la fecha de hoy."
      );
      return false;
    }

    if(!this.selectedCustomers.length) {
      this._messageService.error(
        "Error", 
        "Debe selecionar al menos un cliente."
      );
      return false;
    }

    if(!this.work.wrk_operator_uuid1) {
      this._messageService.error(
        "Error", 
        "Debe seleccionar el usuario 1."
      );
      return false;
    }

    return true;
  }

  private async insertWork(formWork: NgForm): Promise<void> {
    try {
      const response = await firstValueFrom(this._worksService.saveWork(this.work));
      this.isLoading = false;
      const modelItem = response.data;

    } catch (error: any) {
      this.isLoading = false;
      const errorMessage = error?.error?.error || 'Error desconocido';
      this._messageService.error("Error", errorMessage);
      throw error; // 👈 importante: re-lanzar para que el bucle se detenga o maneje el error
    }
  }

  public async onSaveWork(formWork: NgForm): Promise<void> {
    if (!this.validate()) return;

    if (this.routeName) {
      // Caso simple: una sola inserción
      this.work.wrk_route = this.routes.find(e => e.rou_uuid === this.routeName)?.rou_name || null;
      await this.insertWork(formWork);
      this._messageService.success(
              "¡Éxito!", 
              "El Trabajo fue agregado correctamente.",
              () => {
                this._router.navigate(['/admin/user/works']);
              }
            );
    } else {
      // Caso múltiple: varias direcciones
      const selectedUuids = this.list
        .filter(item => item.direction === 'right')
        .map((item: any) => item.key);

      const selectedAddresses = this.addresses.filter(adr =>
        selectedUuids.includes(adr.adr_uuid)
      );

      if (selectedAddresses.length === 0) {
        this._messageService.warning('Advertencia', 'No hay direcciones seleccionadas');
        return;
      }

      // Inicializar progreso
      this.isSavingBatch = true;
      this.totalAddresses = selectedAddresses.length;
      this.currentAddressIndex = 0;
      this.progress = 0;

      try {
        for (const address of selectedAddresses) {
          this.work.adr_uuid = address.adr_uuid;
          this.work.wrk_address = address.adr_address;
          this.work.wrk_customer = address.cus?.cus_fullname || null;
          this.work.wrk_phone = address.cus?.cus_phone || null;
          this.work.wrk_route = address.cus?.rou?.rou_name || null;

          await this.insertWork(formWork); // ✅ espera cada inserción

          // Actualizar progreso
          this.currentAddressIndex++;
          this.progress = Math.round((this.currentAddressIndex / this.totalAddresses) * 100);
          this.currentCustomerName = address.cus?.cus_fullname || 'Cliente';
        }

        this._messageService.success(
              "¡Éxito!", 
              `Se guardaron ${this.totalAddresses} trabajos`,
              () => {
                this._router.navigate(['/admin/user/works']);
              }
            );
      } catch (error) {
        this._messageService.error('Error', 'Falló la inserción de uno o más trabajos');
      } finally {
        this.isSavingBatch = false;
      }
    }
  }
}
