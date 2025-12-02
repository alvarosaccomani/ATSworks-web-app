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
      // Extraer los nombres de los roles usando el algoritmo proporcionado
      const allowedRoles = this.selectedCompany.roles.map((role: any) => role.rol_name);
      
      // Filtrar la navegación basada en los roles permitidos
      this.filteredNavigation = this.filterNavigationByRoles(this.menuItems, allowedRoles);
    } else {
      // Si no hay roles definidos, mostrar toda la navegación
      this.filteredNavigation = [...this.menuItems];
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

  public filterNavigationByRoles(navigation: any[], allowedRoles: string[]): any[] {
    return navigation
      .map((item) => {
        // Crear una copia del item para no modificar el original
        const newItem = { ...item };

        // Si el item tiene roles permitidos definidos, verificar acceso
        if (newItem.allowedRoles) {
          const isAllowed = newItem.allowedRoles.some((role: string) =>
            allowedRoles.includes(role)
          );

          // Si no tiene permisos, excluir el item
          if (!isAllowed) {
            return null;
          }
        }

        // Si el item tiene submenú, filtrar recursivamente
        if (newItem.submenu) {
          newItem.submenu = this.filterNavigationByRoles(newItem.submenu, allowedRoles);
          
          // Si después de filtrar el submenú queda vacío, eliminarlo
          if (newItem.submenu.length === 0) {
            delete newItem.submenu;
          }
        }

        return newItem;
      })
      .filter((item) => item !== null); // Eliminar items nulos
  }
}