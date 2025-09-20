import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { WorkDetailInterface } from '../../../core/interfaces/work-detail';
import { WorksService } from '../../../core/services/works.service';
import { WorksDetailsService } from '../../../core/services/works-details.service';

@Component({
  selector: 'app-work-sheet',
  imports: [
    FormsModule,
    HeaderComponent
  ],
  templateUrl: './work-sheet.component.html',
  styleUrl: './work-sheet.component.scss'
})
export class WorkSheetComponent {
  public work: WorkInterface;
  public status: string = "";
  public isLoading: boolean = false;
  public headerConfig: any = {
    title: "HOJA DE TRABAJO",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit nostrum rerum animi natus beatae ex. Culpa blanditiis tempore amet alias placeat, obcaecati quaerat ullam, sunt est, odio aut veniam ratione.",
    icon: "fab fa-dashcube fa-fw"
  }

  constructor(
    private _route: ActivatedRoute,
    private _worksService: WorksService,
    private _worksDetailsService: WorksDetailsService,
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

}
