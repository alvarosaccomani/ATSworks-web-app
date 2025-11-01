import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { from, of } from 'rxjs';
import { mergeMap, toArray, catchError, pluck } from 'rxjs/operators';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { WorkDetailInterface } from '../../../core/interfaces/work-detail'
import { ModelItemInterface } from '../../../core/interfaces/model-item';
import { DetailModelItemInterface } from '../../../core/interfaces/detail-model-item';
import { CustomerInterface } from '../../../core/interfaces/customer';
import { AddressInterface } from '../../../core/interfaces/address/address.interface';
import { UserRolCompanyInterface } from '../../../core/interfaces/user-rol-company';
import { ModelItemsService } from '../../../core/services/model-items.service';
import { CustomersService } from '../../../core/services/customers.service';
import { AddressesService } from '../../../core/services/addresses.service';
import { UserRolesCompanyService } from '../../../core/services/user-roles-company.service';
import { WorksService } from '../../../core/services/works.service';
import { WorksDetailsService } from '../../../core/services/works-details.service'

declare var Swal: any;

@Component({
  selector: 'app-work',
  imports: [
    FormsModule,
    HeaderComponent,
    DynamicTableComponent,
    PageNavTabsComponent
  ],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss'
})
export class WorkComponent {

  public work!: WorkInterface;
  public modelItems: ModelItemInterface[] = [];
  public modelItem!: ModelItemInterface;
  public customers: CustomerInterface[] = [];
  public customer!: CustomerInterface;
  public addresses: AddressInterface[] = [];
  public usersOperatorWork: UserRolCompanyInterface[] = [];
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
       url: null,
       icon: "fas fa-hand-holding-usd fa-fw",
       title: "TRABAJOS PENDIENTES"
    }
  ]

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
    private _modelsItemsService: ModelItemsService,
    private _customersService: CustomersService,
    private _addressesService: AddressesService,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _worksService: WorksService,
    private _worksDetailsService: WorksDetailsService
  )
  {
    this.workInit();
  }

  ngOnInit(): void {
    this.work.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    this.work.wrk_user_uuid = JSON.parse(localStorage.getItem('identity')!).usr_uuid;
    this.getModelItems(this.work.cmp_uuid!);
    this.getCustomers(this.work.cmp_uuid!);
    this.getUsersOperatorWork(this.work.cmp_uuid!);

    this._route.params.subscribe( (params) => {
      if(params['wrk_uuid'] != 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR TRABAJO",
          description: "Ficha para actualizar un Trabajo.",
          icon: "fas fa-sync-alt fa-fw"
        }
        this.work.wrk_uuid = params['wrk_uuid'];
        this.getWorkById(this.work.cmp_uuid!, params['wrk_uuid']);
      } else {
        this.headerConfig = {
          title: "NUEVO TRABAJO",
          description: "Ficha para agregar un Trabajo.",
          icon: "fas fa-plus fa-fw"
        }
      }
    });
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
      wrk_operator_uuid: null,
      wrk_operator: null,
      itm_uuid: null,
      cmpitm_uuid: null,
      mitm_uuid: null,
      mitm: null,
      wrk_createdat: null,
      wrk_updatedat: null
    }
  }

  private getWorkById(cmp_uuid: string, wrk_uuid: string): void {
    this._worksService.getWorkById(cmp_uuid, wrk_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.work = response.data;
          this.customer = this.work.adr?.cus!;
          this.getAdresses(this.customer.cmp_uuid!, this.customer.cus_uuid!)
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

  private getCustomers(cmp_uuid: string) {
    this._customersService.getCustomers(cmp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.customers = response.data;
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

  private getAdresses(cmp_uuid: string, cus_uuid: string) {
    this._addressesService.getAddresses(cmp_uuid, cus_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.addresses = response.data;
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

  public addCustomer(customer: CustomerInterface) {
    this.customer = customer;
    this.getAdresses(customer.cmp_uuid!, customer.cus_uuid!)
  }

  public removeCustomer() {
    this.customer = null!;
    this.addresses = null!;
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

  public onAddressChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedAddress = this.addresses.find(
      (address: AddressInterface) => address.adr_uuid === selectedValue
    );
    if (selectedAddress) {
      this.work.adr_uuid = selectedAddress.adr_uuid;
    }
  }

  public onWorkOperatorChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedOperator = this.usersOperatorWork.find(
      (operator: UserRolCompanyInterface) => operator.usr_uuid === selectedValue
    );
    if (selectedOperator) {
      this.work.wrk_operator_uuid = selectedOperator.usr_uuid;
    }
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
    if(!this.work.mitm_uuid) {
      this.showMessage("Error", "Debe seleccionar un modelo de rubro.");
      return false;
    }

    if(!this.customer) {
      this.showMessage("Error", "Debe seleccionar un cliente.");
      return false;
    }

    if(!this.work.adr_uuid) {
      this.showMessage("Error", "Debe seleccionar una direccion.");
      return false;
    }

    if(!this.work.wrk_operator_uuid) {
      this.showMessage("Error", "Debe seleccionar un usuario.");
      return false;
    }

    return true;
  }

  private async updateWork(formWork: NgForm): Promise<void> {
    this.isLoading = true;
    this._worksService.updateWork(formWork.form.value).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const modelItem = response.data;
          this.onSaveWorkDetails(modelItem.cmp_uuid, modelItem.wrk_uuid);
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

  private async insertWork(formWork: NgForm): Promise<void> {
    this.isLoading = true;
      this._worksService.saveWork(formWork.form.value).subscribe(
        response => {
          this.isLoading = false;
          const modelItem = response.data;
          this.onSaveWorkDetails(modelItem.cmp_uuid, modelItem.wrk_uuid);
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

  public onSaveWork(formWork: NgForm): void {
    if(this.validate()) {
        if(this.work.wrk_uuid && this.work.wrk_uuid != 'new') {
          this.updateWork(formWork);
        } else {
          this.insertWork(formWork);
        }
    }
  }
  
  public onSaveWorkDetails(cmp_uuid: string, wrk_uuid: string): void {
    // Verificar si hay elementos en workDetails
    if (this.work.workDetails?.length) {
      this.work.workDetails.forEach((e) => {
        e.cmp_uuid = cmp_uuid;
        e.wrk_uuid = wrk_uuid
      });
      // Convertir el array en un observable
      from(this.work.workDetails)
        .pipe(
          // Procesar cada elemento del array
          mergeMap((workDetail: WorkDetailInterface) => {
            // Si es un nuevo registro, asignar la fecha de creación
            if (workDetail.wrkd_createdat === null) {
              workDetail.wrkd_createdat = new Date();
            }
  
            // Determinar si es una inserción o una actualización
            if (!workDetail.wrkd_uuid) {
              // Inserción
              return this._worksDetailsService.insertWorkDetail(workDetail).pipe(
                catchError((error) => {
                  console.error('Error al insertar:', error);
                  return of(null); // Devolver un Observable vacío en caso de error
                })
              );
            } else {
              // Actualización 
              return this._worksDetailsService.updateWorkDetail(workDetail).pipe(
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
            this.showMessage("Informacion", "El Trabajo fue agregado/modificado correctamente.", () => {
              this._router.navigate(['/admin/user/works']);
            });
          }
        });
    } else {
      console.warn('No hay elementos en workDetails para procesar.');
      this.isLoading = false;
    }
  }

}
