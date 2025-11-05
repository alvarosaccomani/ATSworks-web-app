import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { MultiStepComponent } from '../../../shared/components/multi-step/multi-step.component';
import { CameraComponent } from '../../../shared/components/camera/camera.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { WorkDetailInterface } from '../../../core/interfaces/work-detail';
import { WorkAttachmentInterface } from '../../../core/interfaces/work-attachment';
import { MessageService } from '../../../core/services/message.service';
import { WorksService } from '../../../core/services/works.service';
import { WorksDetailsService } from '../../../core/services/works-details.service';
import { WorksAttachmentsService } from '../../../core/services/works-attachments.service';

declare var Swal: any;

@Component({
  selector: 'app-work-sheet',
  imports: [
    FormsModule,
    HeaderComponent,
    MultiStepComponent,
    CameraComponent
  ],
  templateUrl: './work-sheet.component.html',
  styleUrl: './work-sheet.component.scss'
})
export class WorkSheetComponent {
  public work: WorkInterface;
  public status: string = "";
  public isLoading: boolean = false;
  public workDetailsDetail: any;
  public workDetailsObservations: any;
  public headerConfig: any = {
    title: "HOJA DE TRABAJO",
    description: "Ficha de Hoja de Trabajo.",
    icon: "fab fa-dashcube fa-fw"
  }
  public itemsStep: any;
  public step: any;

  constructor(
    private _route: ActivatedRoute,
    private _messageService: MessageService,
    private _worksService: WorksService,
    private _worksDetailsService: WorksDetailsService,
    private _worksAttachmentsService: WorksAttachmentsService
  )
  {
    this.work = {
      cmp_uuid: null,
      wrk_uuid: 'new',
      adr_uuid: null,
      adr: null,
      wrk_description: null,
      wrk_workdate: new Date(),
      wrk_workdateinit: null,
      wrk_workdatefinish: null,
      wrks_uuid: null,
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

  ngOnInit(): void {
    this.itemsStep = [
      {
        id: 1,
        icon: "",
        name: "initial_photo",
        caption: "Foto Inicial",
        title: "Foto Inicial",
        active: true,
        url: ""
      },
      {
        id: 2,
        icon: "",
        name: "work_detail",
        caption: "Detalle Trabajo",
        title: "Detalle Trabajo",
        active: false,
        url: ""
      },
      {
        id: 3,
        icon: "",
        name: "final_photo",
        caption: "Foto Final",
        title: "Foto Final",
        active: false,
        url: ""
      },
      {
        id: 4,
        icon: "",
        name: "work_observations",
        caption: "Observaciones",
        title: "Observaciones",
        active: false,
        url: ""
      }      
    ]

    this.step = this.itemsStep[0];

    this.work.cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;
    this._route.params.subscribe( (params) => {
      if(params['wrk_uuid'] != 'new') {
        this.work.wrk_uuid = params['wrk_uuid'];
        this.getWorkById(this.work.cmp_uuid!, params['wrk_uuid']);
      }
    });
  }

  private getWorkById(cmp_uuid: string, wrk_uuid: string): void {
    this._worksService.getWorkById(cmp_uuid, wrk_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.work = response.data;
          if(this.work.workDetails) {
            this.workDetailsDetail = this.work.workDetails.filter(e => e.wrkd_groupkey === 'work_detail');
            this.workDetailsObservations = this.work.workDetails.filter(e => e.wrkd_groupkey === 'work_observations');
          }
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

  public goToStep($event: any): void {
    this.step = $event;
  }

  public continue(): void {
    this.isLoading = true;
    this.step = this.itemsStep[this.step.index + 1];
    this.isLoading = false;
  }

  public onPhotoSaved(image: string) {
    switch(this.step.name) {
        case 'initial_photo': {
          this.insertInitialPhoto(image);
          break;
        }
        case 'final_photo':
          this.insertFinalPhoto(image);
          break;
      }
  }

  public insertInitialPhoto(image: string) {
    this.work.wrk_workdateinit = new Date();
    this._worksService.updateWork(this.work).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.work.wrk_workdateinit = response.data.wrk_workdateinit;
          console.info(image); // Guardar la imagen recibida
          let workAttachment = {
            cmp_uuid: this.work.cmp_uuid,
            wrk_uuid: this.work.wrk_uuid,
            wrka_uuid: null,
            wrka_attachmenttype: 'imagen',
            wrka_filepath: image,
            wrka_createdat:null,
            wrka_updatedat: null
          }
          this.insertWorAttachment(workAttachment);
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

  public insertFinalPhoto(image: string) {
    this._worksService.updateWork(this.work).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          console.info(image); // Guardar la imagen recibida
          let workAttachment = {
            cmp_uuid: this.work.cmp_uuid,
            wrk_uuid: this.work.wrk_uuid,
            wrka_uuid: null,
            wrka_attachmenttype: 'imagen',
            wrka_filepath: image,
            wrka_createdat:null,
            wrka_updatedat: null
          }
          this.insertWorAttachment(workAttachment);
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

  public insertWorAttachment(workAttachment: WorkAttachmentInterface): void {
    this._worksAttachmentsService.insertWorAttachment(workAttachment).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.work.workAttachments = response.data;
          this.continue();
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

  public findDetailModelItemArrayValues(key: string) {
    let values = this.work.mitm?.detailModelItems?.find((itm => itm.dmitm_key === key))?.dmitm_arrayvalues;
    let arrayValues = values?.split(",").map((el, index) => {
      return {
        id: index,
        value: el.trim()
      }
    });
    return arrayValues;
  }

  public onValueChangeInputText(event: Event, workDetail: WorkDetailInterface): void {
    this.updateWorkDetail(workDetail);
  }

  public onValueChangeInputCheck(event: Event, workDetail: WorkDetailInterface): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    workDetail.wrkd_value = isChecked ? 'true' : 'false';
    this.updateWorkDetail(workDetail);
  }

  public onValueChangeInputNumber(event: Event, workDetail: WorkDetailInterface): void {
    this.updateWorkDetail(workDetail);
  }

  public onValueChangeList(event: Event, workDetail: WorkDetailInterface): void {
    const selected = (event.target as HTMLSelectElement).value;
    const selectedValue = this.findDetailModelItemArrayValues(workDetail.wrkd_key!)?.find(
      (itm: any) => itm.value === selected
    );
    if (selectedValue) {
      this.updateWorkDetail(workDetail);
      console.info(selectedValue);
    }
  }

  public updateWorkDetail(workDetail: WorkDetailInterface) {
    this.isLoading = true;
    this._worksDetailsService.updateWorkDetail(workDetail).subscribe(
      response => {
        if(response.success) {
          this.isLoading = false;
          const customer = response.customer;
          this.status = 'success';
        } else {
          this.isLoading = false;
          //this.status = 'error'
        }
      },
      error => {
        this.isLoading = false;
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  public closeWork(): void {
    this.work.wrk_workdatefinish = new Date();
    this.work.wrks_uuid = "598d9ae5-c82a-4bc6-89b4-d166c99e80c7";
    this._worksService.updateWork(this.work).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.work.wrk_workdatefinish = response.data.wrk_workdatefinish;
          this._messageService.success(
            "Informacion", 
            "El trabajo fue cerrado de manera correcta"
          );
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

}
