import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { UserInterface } from '../../../core/interfaces/user';
import { SessionService } from '../../../core/services/session.service';
import { MenuService } from '../../../core/services/menu.service';
import { SharedDataService } from '../../../core/services/shared-data.service';

declare var $: any;

@Component({
  selector: 'app-side-bar',
  imports: [
    CommonModule,
    HasPermissionDirective,
    RouterLink
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {

  @Input() identity!: UserInterface;

  constructor(
    private _sessionService: SessionService,
    private _menuService: MenuService,
    private _sharedDataService: SharedDataService
  ) { }

  public menuItems: any;
  public selectedCompany: any;
  public filteredNavigation: any[] = [];

  ngOnInit(): void {
    let cmp_uuid;

    // Cargar compañía desde localStorage si existe
    if (this._sessionService.getCompany()) {
      let company = this._sessionService.getCompany();
      cmp_uuid = company.cmp_uuid;
      this.setCompany(company);
    }

    // Obtener items del menú
    this._menuService.getSidebarItems().subscribe((items: any) => {
      this.menuItems = items;
      // Aplicar filtro de roles si ya hay una compañía seleccionada
      if (this.selectedCompany) {
        this.applyRoleFilter();
      }
    });

    // Suscribirse a cambios en la compañía seleccionada
    this._sharedDataService.selectedCompany$.subscribe((company) => {
      this.setCompany(company);
    });
  }

  private setCompany(company: any): void {
    if (company) {
      this.selectedCompany = company;

      // Guardar en localStorage
      this._sessionService.setCompany(JSON.stringify(company));

      // Aplicar filtro de roles si los items del menú ya están cargados
      if (this.menuItems) {
        this.applyRoleFilter();
      }
    }
  }

  private applyRoleFilter(): void {
    if (this.selectedCompany && this.selectedCompany.roles) {
      // 1. Extraer los nombres de los roles (ej: ['admin', 'sysadmin'])
      const userRoles = this.selectedCompany.roles.map((role: any) => role.rol_name);

      // 2. Extraer los permisos (slugs) de TODOS los roles que tiene el usuario en esta empresa
      // Usamos flatMap para aplanar los arrays de rolpers de cada rol
      const userPermissions = this.selectedCompany.roles.flatMap((role: any) =>
        role.rolpers ? role.rolpers.map((rp: any) => rp.per?.per_slug || rp) : []
      );

      // 3. Filtrar la navegación usando ambos criterios
      this.filteredNavigation = this.filterNavigationByRolesAndPermissions(
        this.menuItems,
        userRoles,
        userPermissions
      );

    } else {
      // Si no hay empresa o roles, por seguridad podrías preferir un menú vacío
      this.filteredNavigation = [];
    }
  }

  public closeNavBar(): void {
    var NavLateral = $('.nav-lateral');
    var PageConten = $('.page-content');
    if (NavLateral.hasClass('active')) {
      NavLateral.removeClass('active');
      PageConten.removeClass('active');
    } else {
      NavLateral.addClass('active');
      PageConten.addClass('active');
    }
  }

  public toggleSubMenu(item: any) {
    item.isOpen = !item.isOpen;
  }

  public filterNavigationByRolesAndPermissions(
    navigation: any[],
    allowedRoles: string[],
    userPermissions: string[] // Aquí pasas los slugs: ['menu.dashboard', 'menu.configuracion', ...]
  ): any[] {
    return navigation
      .map((item) => {
        const newItem = { ...item };

        // 1. Validar por Roles (Si el ítem tiene la restricción)
        let roleAllowed = true;
        if (newItem.allowedRoles) {
          roleAllowed = newItem.allowedRoles.some((role: string) =>
            allowedRoles.includes(role)
          );
        }

        // 2. Validar por Permisos Específicos (Si el ítem tiene appPermission)
        let permissionAllowed = true;
        if (newItem.appPermission) {
          permissionAllowed = userPermissions.includes(newItem.appPermission);
        }

        // El ítem solo se muestra si cumple AMBAS o si no tiene restricciones
        if (!roleAllowed || !permissionAllowed) {
          return null;
        }

        // 3. Filtrar submenús recursivamente
        if (newItem.submenu) {
          newItem.submenu = this.filterNavigationByRolesAndPermissions(
            newItem.submenu,
            allowedRoles,
            userPermissions
          );

          // Si el submenú quedó vacío tras el filtro, eliminamos la propiedad
          if (newItem.submenu.length === 0) {
            delete newItem.submenu;
            // Opcional: Si el ítem padre NO tiene URL y su submenú quedó vacío, eliminar al padre
            if (!newItem.url) return null;
          }
        }

        return newItem;
      })
      .filter((item) => item !== null);
  }
}