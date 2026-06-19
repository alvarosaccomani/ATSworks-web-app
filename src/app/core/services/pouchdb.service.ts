/// <reference types="pouchdb" />
import { Injectable, Injector } from '@angular/core';
import PouchDB from 'pouchdb/dist/pouchdb';
import { ConnectionService } from './connection.service';
import { WorksService } from './works.service';
import { WorksDetailsService } from './works-details.service';
import { WorksAttachmentsService } from './works-attachments.service';
import { firstValueFrom, Subject } from 'rxjs';
import { WorkInterface } from '../interfaces/work/work.interface';
import { WorkResults } from '../interfaces/work/work-results.interface';

@Injectable({
  providedIn: 'root',
})
export class PouchdbService {
  private dbWorks: PouchDB.Database;
  private dbQueue: PouchDB.Database;
  private isSyncing = false;
  public syncQueueChanged$ = new Subject<void>();

  constructor(
    private _connectionService: ConnectionService,
    private injector: Injector,
    private _worksDetailsService: WorksDetailsService,
    private _worksAttachmentsService: WorksAttachmentsService
  ) {
    this.dbWorks = new PouchDB('atsworks_works');
    this.dbQueue = new PouchDB('atsworks_sync_queue');

    // Escuchar el estado de conexión
    this._connectionService.connectionStatus$.subscribe((isOnline) => {
      if (isOnline) {
        console.log('[PouchDB] Online detectado. Iniciando sincronización...');
        this.syncPendingQueue();
      }
    });
  }

  private get _worksService(): WorksService {
    return this.injector.get(WorksService);
  }

  // --- MÉTODOS DE BASE DE DATOS LOCAL (WORKS) ---

  public async getWork(wrk_uuid: string): Promise<any> {
    try {
      const doc = await this.dbWorks.get(wrk_uuid);
      return doc;
    } catch (err: any) {
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async saveWork(work: any): Promise<any> {
    try {
      // Intentar obtener el documento existente para conservar el _rev de PouchDB
      const existing = await this.getWork(work.wrk_uuid);
      
      // Filtrar propiedades nulas/indefinidas para no sobreescribir valores válidos de la base de datos
      const cleanedWork = { ...work };
      if (existing) {
        Object.keys(cleanedWork).forEach(key => {
          if (
            (cleanedWork[key] === null || cleanedWork[key] === undefined) &&
            existing[key] !== null &&
            existing[key] !== undefined
          ) {
            delete cleanedWork[key];
          }
        });
      }

      const doc = {
        ...existing,
        ...cleanedWork,
        _id: work.wrk_uuid,
        _rev: existing ? existing._rev : undefined,
      };
      await this.dbWorks.put(doc);
      return doc;
    } catch (err) {
      console.error('[PouchDB] Error al guardar trabajo localmente:', err);
      throw err;
    }
  }

  public async deleteWork(wrk_uuid: string): Promise<void> {
    try {
      const existing = await this.getWork(wrk_uuid);
      if (existing) {
        await this.dbWorks.remove(existing);
        console.log(`[PouchDB] Trabajo ${wrk_uuid} eliminado de la base de datos local por estar cerrado.`);
      }
    } catch (err) {
      console.error('[PouchDB] Error al eliminar trabajo localmente:', err);
      throw err;
    }
  }

  public async updateLocalWorkDetail(wrk_uuid: string, workDetail: any): Promise<any> {
    const work = await this.getWork(wrk_uuid);
    if (!work) return null;

    if (!work.workDetails) {
      work.workDetails = [];
    }

    const index = work.workDetails.findIndex((d: any) => d.wrkd_uuid === workDetail.wrkd_uuid);
    if (index !== -1) {
      work.workDetails[index] = { ...work.workDetails[index], ...workDetail };
    } else {
      work.workDetails.push(workDetail);
    }

    await this.saveWork(work);
    return work;
  }

  public async addLocalWorkAttachment(wrk_uuid: string, attachment: any): Promise<any> {
    const work = await this.getWork(wrk_uuid);
    if (!work) return null;

    if (!work.workAttachments) {
      work.workAttachments = [];
    }

    const isInit = attachment.wrka_uuid && attachment.wrka_uuid.startsWith('temp_init');
    const isFinal = attachment.wrka_uuid && attachment.wrka_uuid.startsWith('temp_final');

    const index = work.workAttachments.findIndex((a: any) => {
      if (isInit && a.wrka_uuid && a.wrka_uuid.startsWith('temp_init')) return true;
      if (isFinal && a.wrka_uuid && a.wrka_uuid.startsWith('temp_final')) return true;
      return a.wrka_uuid === attachment.wrka_uuid;
    });

    if (index !== -1) {
      work.workAttachments[index] = { ...work.workAttachments[index], ...attachment };
    } else {
      work.workAttachments.push(attachment);
    }

    await this.saveWork(work);
    return work;
  }

  public async saveWorksBatch(works: WorkInterface[]): Promise<void> {
    for (const work of works) {
      await this.saveWork(work);
    }
  }

  public async getPendingWorksLocal(
    searchWorkState: string,
    searchRoute: string,
    page: number,
    perPage: number,
    fieldSortValue: string,
    sortValue: string
  ): Promise<WorkResults> {
    try {
      const result = await this.dbWorks.allDocs({ include_docs: true });
      let docs = result.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc.wrk_uuid && doc.wrks_uuid);

      // 1. Filtrar por estado del trabajo (wrks_uuid)
      if (searchWorkState) {
        docs = docs.filter((doc: any) => doc.wrks_uuid === searchWorkState);
      }

      // 2. Filtrar por recorrido (wrk_route / ruta)
      if (searchRoute) {
        const filterRoute = searchRoute.toLowerCase();
        docs = docs.filter((doc: any) => {
          const route = (doc.wrk_route || '').toLowerCase();
          return route.includes(filterRoute);
        });
      }

      // 3. Ordenar
      docs.sort((a: any, b: any) => {
        let valA = a[fieldSortValue];
        let valB = b[fieldSortValue];

        if (fieldSortValue === 'wrk_workdate') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else {
          valA = valA || '';
          valB = valB || '';
        }

        if (valA < valB) return sortValue === 'ASC' ? -1 : 1;
        if (valA > valB) return sortValue === 'ASC' ? 1 : -1;
        return 0;
      });

      // 4. Calcular paginación
      const totalElements = docs.length;
      const totalPages = Math.ceil(totalElements / perPage);
      const startIndex = (page - 1) * perPage;
      const paginatedData = docs.slice(startIndex, startIndex + perPage);

      return {
        item: startIndex + 1,
        itemOf: Math.min(startIndex + perPage, totalElements),
        numElements: totalElements,
        totalPages: totalPages || 1,
        data: paginatedData,
      };
    } catch (err) {
      console.error('[PouchDB] Error al consultar trabajos locales:', err);
      return {
        item: 0,
        itemOf: 0,
        numElements: 0,
        totalPages: 1,
        data: [],
      };
    }
  }

  public async getWorkSyncStatus(wrk_uuid: string): Promise<'local' | 'synced'> {
    try {
      const queue = await this.getQueueItems();
      const hasPending = queue.some((item: any) => {
        const payloadUuid = item.payload?.wrk_uuid;
        return payloadUuid === wrk_uuid;
      });
      return hasPending ? 'local' : 'synced';
    } catch (err) {
      console.error('[PouchDB] Error al obtener estado de sincronización local:', err);
      return 'synced';
    }
  }

  // --- MÉTODOS DE LA COLA DE SINCRONIZACIÓN ---

  public async enqueue(action: string, payload: any, deduplicateKey?: string): Promise<void> {
    const timestamp = Date.now();

    if (deduplicateKey) {
      try {
        const result = await this.dbQueue.allDocs({ include_docs: true });
        const existingRow = result.rows.find((row: any) => row.doc.deduplicateKey === deduplicateKey);

        if (existingRow) {
          const existing = existingRow.doc as any;
          
          // Fusionar payloads de forma defensiva para no sobreescribir con valores nulos o indefinidos
          const mergedPayload = { ...existing.payload, ...payload };
          Object.keys(payload).forEach(key => {
            if (
              (payload[key] === null || payload[key] === undefined) &&
              existing.payload[key] !== null &&
              existing.payload[key] !== undefined
            ) {
              mergedPayload[key] = existing.payload[key];
            }
          });

          existing.payload = mergedPayload;
          existing.timestamp = timestamp;
          await this.dbQueue.put(existing);
          console.log(`[PouchDB] Acción actualizada en cola (deduplicada): ${action} con clave ${deduplicateKey}`);
          
          this.syncQueueChanged$.next();
          
          if (this._connectionService.isOnline()) {
            this.syncPendingQueue();
          }
          return;
        }
      } catch (err) {
        console.warn('[PouchDB] Error al buscar duplicado en cola, se insertará normalmente:', err);
      }
    }

    const queueItem = {
      _id: `sync_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      action,
      payload,
      timestamp,
      deduplicateKey,
    };
    await this.dbQueue.put(queueItem);
    console.log(`[PouchDB] Acción encolada: ${action}`, payload);

    this.syncQueueChanged$.next();

    if (this._connectionService.isOnline()) {
      this.syncPendingQueue();
    }
  }

  public async getQueueItems(): Promise<any[]> {
    try {
      const result = await this.dbQueue.allDocs({ include_docs: true });
      return result.rows
        .map((row: any) => row.doc)
        .sort((a: any, b: any) => a.timestamp - b.timestamp);
    } catch (err) {
      console.error('[PouchDB] Error al leer la cola de sincronización:', err);
      return [];
    }
  }

  // --- PROCESADOR DE COLA / SINCRONIZACIÓN ---

  public async syncPendingQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      let queueItems = await this.getQueueItems();
      if (queueItems.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[PouchDB] Sincronizando ${queueItems.length} operaciones pendientes...`);

      for (const item of queueItems) {
        if (!this._connectionService.isOnline()) {
          console.warn('[PouchDB] Conexión perdida durante la sincronización.');
          break;
        }

        try {
          const response = await this.processSyncItem(item);
          
          // Actualizar caché local para mantener la consistencia
          await this.updateLocalCacheAfterSync(item, response);

          // Eliminar de la cola tras éxito
          await this.dbQueue.remove(item);
          console.log(`[PouchDB] Sincronizado correctamente: ${item.action}`);
          
          this.syncQueueChanged$.next();
        } catch (error) {
          console.error(`[PouchDB] Error al procesar item de cola (${item.action}):`, error);
          // Detener la sincronización para no alterar el orden si falla por problemas del servidor
          break;
        }
      }
    } catch (err) {
      console.error('[PouchDB] Error en la cola de sincronización:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async updateLocalCacheAfterSync(item: any, response: any): Promise<void> {
    if (!response || !response.success || !response.data) return;

    const { action, payload } = item;
    const data = response.data;

    try {
      if (action === 'update_work') {
        if (data.wrks_uuid === '598d9ae5-c82a-4bc6-89b4-d166c99e80c7' || (data.wrks && data.wrks.wrks_name === 'Cerrado')) {
          await this.deleteWork(data.wrk_uuid);
        } else {
          await this.saveWork(data);
        }
      } else if (action === 'insert_attachment') {
        const work = await this.getWork(payload.wrk_uuid);
        if (work && work.workAttachments) {
          const isInit = payload.wrka_uuid && payload.wrka_uuid.startsWith('temp_init');
          
          const index = work.workAttachments.findIndex((a: any) => {
            if (isInit) {
              return a.wrka_uuid && a.wrka_uuid.startsWith('temp_init');
            } else {
              return a.wrka_uuid && a.wrka_uuid.startsWith('temp_final');
            }
          });

          if (index !== -1) {
            work.workAttachments[index] = data;
          } else {
            work.workAttachments.push(data);
          }
          await this.saveWork(work);
        }
      }
    } catch (err) {
      console.warn('[PouchDB] Error al actualizar la caché local después de sincronizar:', err);
    }
  }

  private async processSyncItem(item: any): Promise<any> {
    const { action, payload } = item;

    switch (action) {
      case 'update_work':
        return await firstValueFrom(this._worksService.updateWork(payload));

      case 'update_work_detail':
        return await firstValueFrom(this._worksDetailsService.updateWorkDetail(payload));

      case 'insert_attachment':
        return await firstValueFrom(this._worksAttachmentsService.insertWorAttachment(payload));

      default:
        throw new Error(`Acción desconocida en la cola: ${action}`);
    }
  }
}
