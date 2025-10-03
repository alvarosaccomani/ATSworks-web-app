import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { WorksService } from '../../../core/services/works.service';
import { WorksAttachmentsService } from '../../../core/services/works-attachments.service';

@Component({
  selector: 'app-work-sheet-view',
  imports: [
    HeaderComponent
  ],
  templateUrl: './work-sheet-view.component.html',
  styleUrl: './work-sheet-view.component.scss'
})
export class WorkSheetViewComponent {

  public work: WorkInterface;
  public headerConfig: any = {
    title: "RESUMEN DE TRABAJO",
    description: "Resumen de Trabajo.",
    icon: "fas fa-clipboard-list"
  }

  constructor(
    private _route: ActivatedRoute,
    private _worksService: WorksService,
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

}
