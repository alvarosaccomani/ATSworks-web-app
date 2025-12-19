import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { WorkInterface } from '../../../core/interfaces/work';
import { SessionService } from '../../../core/services/session.service';
import { WorksService } from '../../../core/services/works.service';
import { WorksAttachmentsService } from '../../../core/services/works-attachments.service';

@Component({
  selector: 'app-work-sheet-view',
  imports: [
    DatePipe,
    HeaderComponent
  ],
  templateUrl: './work-sheet-view.component.html',
  styleUrl: './work-sheet-view.component.scss'
})
export class WorkSheetViewComponent {

  public work: WorkInterface;
  public isLoading: boolean = false;
  public headerConfig: any = {
    title: "RESUMEN DE TRABAJO",
    description: "Resumen de Trabajo.",
    icon: "fas fa-clipboard-list"
  }

  constructor(
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
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
      wrk_operator_uuid1: null,
      wrk_operator1: null,
      wrk_operator_uuid2: null,
      wrk_operator2: null,
      wrk_operator_uuid3: null,
      wrk_operator3: null,
      wrk_operator_uuid4: null,
      wrk_operator4: null,
      itm_uuid: null,
      cmpitm_uuid: null,
      mitm_uuid: null,
      mitm: null,
      wrk_createdat: null,
      wrk_updatedat: null
    }
  }

  ngOnInit(): void {
    this.work.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
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

  private getKey(key: string): string {
    return this.work.workDetails?.filter(e => e.wrkd_key === key)[0].wrkd_value || "";
  }

  public async sendWhatsApp() {
    if(this.work.workAttachments?.length) {
      this.isLoading = true;
      const text = `
        HOLA, BUENAS TARDES.
        A continuación enviamos el resultado de la visita semanal.
        El dia ${this.work.wrk_workdate} se realizó el mantenimiento de su piscina.
        HORARIO DE VISITA: ${this.work.wrk_workdateinit}
        Estado general: ${this.getKey('estado_pileta')}
        Nivel de agua: ${this.getKey('nivel_agua')}
        Hojas: ${this.getKey('cantidad_hojas')}
        Presencia de verdín: ${this.getKey('presencia_verdin')}
        Limpieza de Skymer: ${this.getKey('limpieza_skimmer')}
        Medicion de cloro en agua: ${this.getKey('medicion_agua')}
        Filtrado de hojas y otros: ${this.getKey('filtrado_otros')}
        Aspirado de fondo: ${this.getKey('aspirado_fondo')}
        Observaciones:
        ${this.getKey('observaciones')}
        Cualquier duda o consulta, quedo a su disposición.
        Faustino, administrativo Tilikum Mantenimientos.
        Saludos
      `;
      let images: string[] = [];
      this.work.workAttachments.forEach(e => {
        images.push(e.wrka_filepath!);
      })
      await this.shareMultipleToWhatsApp(text, images);
      this.isLoading = false;
    }
  }

  private async shareMultipleToWhatsApp(text: string, base64Images: string[]) {
    try {
      // 1. Convertimos todas las imágenes Base64 a una lista de archivos
      const filePromises = base64Images.map(async (base64, index) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        // Creamos un nombre único para cada imagen
        return new File([blob], `imagen_${index + 1}.jpg`, { type: 'image/jpeg' });
      });

      const files = await Promise.all(filePromises);

      // 2. Verificamos si el navegador soporta compartir esta lista de archivos
      if (navigator.canShare && navigator.canShare({ files: files })) {
        await navigator.share({
          title: 'Resumen de Trabajo',
          text: text,
          files: files // Enviamos el array completo
        });
      } else {
        // Fallback si el navegador no permite archivos (como en la mayoría de PCs)
        alert('Tu navegador no soporta compartir múltiples imágenes. Se enviará solo el texto.');
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al procesar o compartir las imágenes:', error);
      alert('Hubo un error al preparar las imágenes para compartir.');
    }
  }

}
