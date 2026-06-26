import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { WorksService } from '../../../core/services/works.service';
import { WorksHistoryService } from '../../../core/services/works-history.service';
import { WorkStatesService } from '../../../core/services/work-states.service';
import { WorkInterface, WorkResults } from '../../../core/interfaces/work';
import { WorkStateInterface } from '../../../core/interfaces/work-state';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-works',
  imports: [
    FormsModule,
    AsyncPipe,
    DatePipe,
    RouterLink,
    NzSelectModule,
    HeaderComponent,
    PageNavTabsComponent,
    PaginationComponent
  ],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss'
})
export class WorksComponent {

  //Pagination
  public page: number = 1; //Page number we are on. Will be 1 the first time the component is loaded (<li> hidden)
  public perPage: number = 10; //Number of items displayed per page
  public numElements!: number; //Total existing items

  // Variables para filtros
  public searchDateFrom: string = "";
  public searchDateTo: string = "";
  public searchCustomer: string = "";
  public fieldSortValue: string = "wrk_workdate";
  public sortValue: string = "ASC";

  // Variables de Historial en Panel Lateral (Drawer)
  public isHistoryDrawerOpen: boolean = false;
  public selectedWorkForHistory: WorkInterface | null = null;
  public workHistoryList: any[] = [];
  public isLoadingHistory: boolean = false;

  // Variables para Estados de Trabajo
  public workStates: WorkStateInterface[] = [];
  public drawerStatusUuid: string = "";
  public drawerComment: string = "";
  public isSavingState: boolean = false;
  public searchWorkState: string = "";

  private cmp_uuid!: string;
  public works$!: Observable<WorkResults>;
  public headerConfig: any = {
    title: "LISTA DE TRABAJOS",
    description: "Listado de Trabajos.",
    icon: "fas fa-clipboard-list fa-fw"
  }
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

  constructor(
      private _sessionService: SessionService,
      private _messageService: MessageService,
      private _worksService: WorksService,
      private _worksHistoryService: WorksHistoryService,
      private _workStatesService: WorkStatesService,
      private _sharedDataService: SharedDataService
    ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.initDate();
    this.getWorkStates(this.cmp_uuid);
    this.loadWorks();

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if (company) {
        console.info(company);
        this.cmp_uuid = company.cmp_uuid;
        this.getWorkStates(this.cmp_uuid);
        this.loadWorks();
      }
    });
  }

  private loadWorks(pageNumber: number = this.page): void {
    this.works$ = this._worksService.getWorks(
      this.cmp_uuid,
      this.searchDateFrom,
      this.searchDateTo,
      this.searchCustomer,
      this.searchWorkState || undefined,
      pageNumber,
      this.perPage,
      this.fieldSortValue,
      this.sortValue
    );
  }

  // Formatea una fecha como 'YYYY-MM-DD'
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private initDate(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    // Asigna las fechas formateadas
    this.searchDateFrom = this.formatDate(haceUnMes);
    this.searchDateTo = this.formatDate(hoy); // si tienes otra variable para "hasta"
  }

  public filter(): void {
    this.loadWorks();
  }

  public clearSearch(): void {
    this.initDate();
    this.searchCustomer = "";
    this.searchWorkState = "";
    this.loadWorks(1);
  }

  public deleteWork(work: WorkInterface) {
    this._messageService.showCustomMessage({
        title: "@SISTEMAS: ¿Estás seguro de eliminar el Trabajo?",
        type: "question",
        text: "Estás a punto de eliminar el Trabajo.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "No, cancelar"
      },
      (result: any) => {
        if (result.value) {
          this._worksService.deleteWork(work.cmp_uuid!, work.wrk_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.loadWorks();
              },
              error => {
                this._messageService.error("Error", error.error.error || "Ocurrió un error al eliminar el trabajo.");
              }
            );
        }
      }
    );
  }

  public goToPage(page: number): void {
    this.page = page;
    this.loadWorks(page);
  }

  public openHistoryDrawer(work: WorkInterface): void {
    this.selectedWorkForHistory = work;
    this.isHistoryDrawerOpen = true;
    this.workHistoryList = [];
    this.isLoadingHistory = true;
    this.drawerStatusUuid = work.wrks_uuid || "";
    this.drawerComment = "";
    
    this._worksHistoryService.getworkHistory(work.cmp_uuid!, work.wrk_uuid!)
      .subscribe({
        next: (response) => {
          this.workHistoryList = response.data || [];
          this.isLoadingHistory = false;
        },
        error: (err: any) => {
          console.error("Error al obtener historial:", err);
          this._messageService.error("Error", "No se pudo recuperar el historial del trabajo.");
          this.isLoadingHistory = false;
        }
      });
  }

  public closeHistoryDrawer(): void {
    this.isHistoryDrawerOpen = false;
    this.selectedWorkForHistory = null;
    this.workHistoryList = [];
  }

  private getWorkStates(cmp_uuid: string): void {
    this._workStatesService.getWorkStates(cmp_uuid).subscribe({
      next: (response) => {
        this.workStates = response.data || [];
      },
      error: (err) => {
        console.error("Error al obtener los estados de trabajo:", err);
      }
    });
  }

  public getSelectedStateColor(statusUuid: string | null | undefined, fallback: string | null = '#374151'): string {
    if (!statusUuid) return fallback || '#374151';
    const state = this.workStates.find(s => s.wrks_uuid === statusUuid);
    return state?.wrks_bkcolor || fallback || '#374151';
  }

  public getSelectedStateFrColor(statusUuid: string | null | undefined, fallback: string | null = '#ffffff'): string {
    if (!statusUuid) return fallback || '#ffffff';
    const state = this.workStates.find(s => s.wrks_uuid === statusUuid);
    return state?.wrks_frcolor || fallback || '#ffffff';
  }

  public saveDrawerState(): void {
    if (!this.selectedWorkForHistory) return;
    
    const work = this.selectedWorkForHistory;
    const currentStatusName = work.wrks?.wrks_name || '';

    // 1. Guard check for allowed states
    if (currentStatusName !== "Pendiente" && currentStatusName !== "A Recuperar/Reprogramar") {
      this._messageService.error("Acción denegada", "Solo se puede cambiar el estado de trabajos que estén en 'Pendiente' o 'A Recuperar/Reprogramar'.");
      return;
    }

    // 2. Guard check for mandatory comment
    if (!this.drawerComment || !this.drawerComment.trim()) {
      this._messageService.error("Campo obligatorio", "Es obligatorio ingresar un comentario o motivo para guardar los cambios.");
      return;
    }

    this.isSavingState = true;
    const updatedFields = {
      ...work,
      wrks_uuid: this.drawerStatusUuid,
      comment: this.drawerComment.trim()
    };

    this._worksService.updateWork(updatedFields).subscribe({
      next: (response) => {
        this._messageService.success("Éxito", "El estado del trabajo y comentario han sido guardados.");
        this.isSavingState = false;
        this.drawerComment = "";
        
        work.wrks_uuid = this.drawerStatusUuid;
        const matchingState = this.workStates.find(s => s.wrks_uuid === this.drawerStatusUuid);
        if (matchingState && work.wrks) {
          work.wrks.wrks_name = matchingState.wrks_name;
          work.wrks.wrks_bkcolor = matchingState.wrks_bkcolor;
          work.wrks.wrks_frcolor = matchingState.wrks_frcolor;
        }
        
        this.loadWorks();
        this.openHistoryDrawer(work);
      },
      error: (err) => {
        console.error("Error al guardar el estado en el historial:", err);
        this._messageService.error("Error", "No se pudo actualizar el estado del trabajo.");
        this.isSavingState = false;
      }
    });
  }

  public changeInlineStatus(work: WorkInterface, newStatusUuid: string): void {
    if (work.wrks_uuid === newStatusUuid) return;

    const currentStatusName = work.wrks?.wrks_name || '';

    // 1. Guard check for allowed states
    if (currentStatusName !== "Pendiente" && currentStatusName !== "A Recuperar/Reprogramar") {
      this._messageService.error("Acción denegada", "Solo se puede cambiar el estado de trabajos que estén en 'Pendiente' o 'A Recuperar/Reprogramar'.");
      this.loadWorks();
      return;
    }

    // 2. Prompt for comment using premium dark SweetAlert2 popup
    Swal.fire({
      title: 'Comentario requerido',
      text: 'Por favor, ingresá un comentario o motivo para el cambio de estado:',
      input: 'text',
      inputPlaceholder: 'Escribí el motivo acá...',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#ffffff',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡El comentario es obligatorio!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const comment = result.value.trim();

        const updatedFields = {
          ...work,
          wrks_uuid: newStatusUuid,
          comment: comment
        };

        this._worksService.updateWork(updatedFields).subscribe({
          next: (response) => {
            this._messageService.success("Éxito", "El estado del trabajo ha sido actualizado.");
            this.loadWorks();
          },
          error: (err) => {
            console.error("Error al actualizar estado inline:", err);
            this._messageService.error("Error", "No se pudo actualizar el estado del trabajo.");
            this.loadWorks();
          }
        });
      } else {
        // Reset the selector value
        this.loadWorks();
      }
    });
  }
}

