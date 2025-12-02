import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AppPermissionsService } from '../../core/services/app-permissions.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  // Inyección de dependencias moderna
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private permissionsService = inject(AppPermissionsService);

  @Input() set appHasPermission(slug: string) {
    this.updateView(slug);
  }

  private updateView(slug: string) {
    // 1. Verificamos con el servicio
    const hasAccess = this.permissionsService.hasPermission(slug);

    // 2. Manipulamos el DOM
    if (hasAccess) {
      // Si tiene permiso y no está pintado, lo pintamos
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      // Si no tiene permiso, limpiamos el contenedor (elimina el elemento del DOM)
      this.viewContainer.clear();
    }
  }

}
