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
      wrk_customer: null,
      wrk_address: null,
      wrk_coordinates: null,
      wrk_phone: null,
      twrk_uuid: null,
      wrk_route: null,
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

  private formatDateToDayMonth(dateString: string): string {
    // Parsear la fecha
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
    }

    // Nombres de los meses en español (puedes ajustar según necesidad)
    const months = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    const day = date.getDate(); // Día del mes (1–31)
    const month = months[date.getMonth()]; // Mes en español y mayúsculas

    return `${day} de ${month}`;
  }

  private getHoraMinutos(fechaString: string): string {
    const fecha = new Date(fechaString);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
        throw new Error('Fecha inválida');
    }

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${horas}:${minutos}`;
  }

  private getKey(key: string): string {
    return this.work.workDetails?.filter(e => e.wrkd_key === key)[0].wrkd_value || "";
  }

  public async sendWhatsApp() {
    if(this.work.workAttachments?.length) {
      this.isLoading = true;
      const text = `HOLA, BUENAS TARDES.\nA continuación enviamos el resultado de la visita semanal.\nEl día *${this.formatDateToDayMonth(this.work.wrk_workdate?.toString()!)}* se realizó el mantenimiento de su piscina.\nHORARIO DE VISITA: *${this.getHoraMinutos(this.work.wrk_workdateinit?.toString()!)}*\nEstado general: *${this.getKey('estado_pileta') ? this.getKey('estado_pileta').toUpperCase() : 'SIN CARGAR'}*\nNivel de agua: *${this.getKey('nivel_agua') ? this.getKey('nivel_agua').toUpperCase() : 'SIN CARGAR'}*\nHojas: *${this.getKey('cantidad_hojas') ? this.getKey('cantidad_hojas').toUpperCase() :  'SIN CARGAR'}*\nPresencia de verdín: *${this.getKey('cantidad_hojas') ? this.getKey('presencia_verdin').toUpperCase() :  'SIN CARGAR'}*\nLimpieza de Skymer: *${this.getKey('limpieza_skimmer') === 'true' ? 'SI' : 'NO'}*\nMedicion de cloro en agua: *${this.getKey('medicion_agua') ? this.getKey('medicion_agua').toUpperCase() : 'SIN CARGAR'}*\nFiltrado de hojas y otros: *${this.getKey('filtrado_otros') === 'true' ? 'SI' : 'NO'}*\nAspirado de fondo: *${this.getKey('aspirado_fondo') === 'true' ? 'SI' : 'NO'}*\nObservaciones:\n*${this.getKey('observaciones').toUpperCase()}*\nCualquier duda o consulta, quedo a su disposición.\nFaustino, administrativo Tilikum Mantenimientos.\nSaludos`;
      let images: string[] = [];
      this.work.workAttachments.forEach(e => {
        images.push(e.wrka_filepath!);
      })
      await this.shareMultipleToWhatsApp(text.trim(), images);
      this.isLoading = false;
    }
  }

  private async shareMultipleToWhatsApp(text: string, base64Images: string[]) {
    try {
      const filePromises = base64Images.map(async (base64, index) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        return new File([blob], `reporte_${index + 1}.jpg`, { type: 'image/jpeg' });
      });

      const files = await Promise.all(filePromises);

      // IMPORTANTE: Validar si se puede compartir el conjunto completo (archivos + texto)
      const shareData: ShareData = {
        files: files,
        title: text, // Algunos SO usan el título como caption
        text: text    // Otros usan el text
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('El navegador no permite compartir archivos y texto juntos.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Si falla, intentamos enviar solo el texto por el link clásico como último recurso
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

}
