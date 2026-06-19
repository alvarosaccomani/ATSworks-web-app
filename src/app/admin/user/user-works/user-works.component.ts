import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { WorksService } from '../../../core/services/works.service';
import { PouchdbService } from '../../../core/services/pouchdb.service';
import { ConnectionService } from '../../../core/services/connection.service';
import { MessageService } from '../../../core/services/message.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-user-works',
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    HeaderComponent
  ],
  templateUrl: './user-works.component.html',
  styleUrl: './user-works.component.scss',
})
export class UserWorksComponent implements OnInit, OnDestroy {
  public works: any[] = [];
  public filteredWorks: any[] = [];
  public searchTerm: string = '';
  public isLoading: boolean = false;
  private cmp_uuid!: string;
  private usr_uuid!: string;
  private syncSubscription!: Subscription;

  public headerConfig: any = {
    title: "MIS TRABAJOS",
    description: "Listado de trabajos asignados con soporte offline.",
    icon: "fas fa-clipboard-list fa-fw"
  };

  constructor(
    private _router: Router,
    private _sessionService: SessionService,
    private _worksService: WorksService,
    private _pouchdbService: PouchdbService,
    private _connectionService: ConnectionService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    const identity = this._sessionService.getIdentity();
    if (company && identity) {
      this.cmp_uuid = company.cmp_uuid;
      this.usr_uuid = identity.usr_uuid;
      this.loadWorks();

      // Suscribirse a cambios en la cola de sincronización para actualizar la vista de forma reactiva
      this.syncSubscription = this._pouchdbService.syncQueueChanged$.subscribe(() => {
        this.loadLocalWorks();
      });
    } else {
      this._messageService.error('Error', 'No se pudo recuperar la información de sesión.');
    }
  }

  ngOnDestroy(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }

  public async loadWorks(): Promise<void> {
    this.isLoading = true;
    try {
      if (this._connectionService.isOnline()) {
        // Traer todos los trabajos pendientes de este operario en lote desde la API
        // Parámetros: cmp_uuid, usr_uuid, wrks_uuid (pendiente), route (null), page (1), perPage (9999)
        // Nota: en works.service.ts, el método automáticamente guarda en lote (saveWorksBatch) en PouchDB en su pipe `tap`.
        await firstValueFrom(
          this._worksService.getPendingWorksByUser(this.cmp_uuid, this.usr_uuid, 'bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823', '', 1, 9999)
        );
      }
    } catch (error) {
      console.warn('Error cargando de la API, se usará la base de datos local:', error);
    } finally {
      // Cargamos de PouchDB localmente
      await this.loadLocalWorks();
      this.isLoading = false;
    }
  }

  private async loadLocalWorks(): Promise<void> {
    try {
      // Recuperar todos los trabajos pendientes de la PouchDB local
      const localResult = await this._pouchdbService.getPendingWorksLocal(
        'bcaa7b3b-cdbf-4b02-8a91-78a67b5aa823', // wrks_uuid por defecto (pendiente)
        '', // sin filtro de ruta por defecto
        1,
        9999, // todos los registros locales
        'wrk_workdate',
        'ASC'
      );

      // Filtrar los que pertenecen al operario actual
      const myLocalWorks = (localResult.data || []).filter(w =>
        w.wrk_operator_uuid1 === this.usr_uuid ||
        w.wrk_operator_uuid2 === this.usr_uuid ||
        w.wrk_operator_uuid3 === this.usr_uuid ||
        w.wrk_operator_uuid4 === this.usr_uuid
      );

      // Para cada trabajo local, verificar su estado de sincronización real en la cola de PouchDB
      const enrichedWorks = [];
      for (const w of myLocalWorks) {
        const syncStatus = await this._pouchdbService.getWorkSyncStatus(w.wrk_uuid!);
        enrichedWorks.push({
          ...w,
          syncStatus // 'local' | 'synced'
        });
      }

      this.works = enrichedWorks;
      this.applyFilter();
    } catch (err) {
      console.error('Error al cargar trabajos locales de PouchDB:', err);
      this.works = [];
      this.applyFilter();
    }
  }

  public applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredWorks = [...this.works];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredWorks = this.works.filter(w => {
      const customerEventual = (w.wrk_customer || '').toLowerCase();
      const customerFixed = (w.adr?.cus?.cus_fullname || '').toLowerCase();
      const address = (w.wrk_address || '').toLowerCase();
      const description = (w.wrk_description || '').toLowerCase();
      return customerEventual.includes(term) || customerFixed.includes(term) || address.includes(term) || description.includes(term);
    });
  }

  public onSearchChange(): void {
    this.applyFilter();
  }

  public isOnline(): boolean {
    return this._connectionService.isOnline();
  }
}
