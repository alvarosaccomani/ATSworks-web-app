import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-side-bar',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {

  constructor(
    private _sharedDataService: SharedDataService
  ) { }

  public menuItems: any;
  public selectedCompany: any;
  public filteredNavigation: any[] = [];

  ngOnInit(): void {

    let cmp_uuid = JSON.parse(localStorage.getItem('company')!).cmp_uuid;

    this.menuItems = [
      {
        name: 'Dashboard',
        icon: 'fab fa-dashcube fa-fw',
        hasSubmenu: false,
        url: 'dashboard',
        allowedRoles: ['admin', 'editor']
      },
      {
        name: 'Clientes',
        icon: 'fas fa-users fa-fw',
        url: null,
        hasSubmenu: true,
        isOpen: false,
        submenu: [
          { 
            name: 'Agregar Cliente',
            icon: 'fas fa-plus fa-fw',
            url: '/admin/user/customer/new',
            allowedRoles: ['admin']
          },
          { 
            name: 'Lista de clientes',
            icon: 'fas fa-clipboard-list fa-fw',
            url: 'customers',
            allowedRoles: ['admin', 'viewer']
          },
          {
            name: 'Buscar cliente',
            icon: 'fas fa-search fa-fw',
            url: null,
            allowedRoles: ['admin', 'editor']
          }
        ]
      },
      {
        name: 'Items',
        icon: 'fas fa-pallet fa-fw',
        url: null,
        hasSubmenu: true,
        isOpen: false,
        allowedRoles: ['sysadmin'],
        submenu: [
          { 
            name: 'Agregar item',
            icon: 'fas fa-plus fa-fw',
            url: null,
            allowedRoles: ['sysadmin']
          },
          { 
            name: 'Lista de items',
            icon: 'fas fa-clipboard-list fa-fw',
            url: 'items',
            allowedRoles: ['sysadmin']
          },
          {
            name: 'Buscar item',
            icon: 'fas fa-search fa-fw',
            url: null,
            allowedRoles: ['sysadmin']
          }
        ]
      },
      {
        name: 'Modelo Items',
        icon: 'fas fa-pallet fa-fw',
        url: null,
        hasSubmenu: true,
        isOpen: false,
        allowedRoles: ['admin'],
        submenu: [
          { 
            name: 'Agregar modelo item',
            icon: 'fas fa-plus fa-fw',
            url: null,
            allowedRoles: ['admin']
          },
          { 
            name: 'Lista de modelo items',
            icon: 'fas fa-clipboard-list fa-fw',
            url: 'models-items',
            allowedRoles: ['admin']
          },
          {
            name: 'Buscar modelo item',
            icon: 'fas fa-search fa-fw',
            url: null,
            allowedRoles: ['admin']
          }
        ]
      },
      {
        name: 'Trabajos',
        icon: 'fas fa-file-invoice-dollar fa-fw',
        url: null,
        hasSubmenu: true,
        isOpen: false,
        submenu: [
          { 
            name: 'Nuevo trabajo',
            icon: 'fas fa-plus fa-fw',
            url: null
          },
          { 
            name: 'Lista de trabajos',
            icon: 'fas fa-clipboard-list fa-fw',
            url: 'works'
          },
          {
            name: 'Buscar trabajos',
            icon: 'fas fa-search fa-fw',
            url: null
          }
        ]
      },
      {
        name: 'Usuarios',
        icon: 'fas fa-user-secret fa-fw',
        url: null,
        hasSubmenu: true,
        isOpen: false,
        submenu: [
          { 
            name: 'Nuevo usuario',
            icon: 'fas fa-plus fa-fw',
            url: '/admin/application/user/new',
            allowedRoles: ['admin', 'editor']
          },
          { 
            name: 'Lista de usuarios',
            icon: 'fas fa-clipboard-list fa-fw',
            url: '/admin/application/users',
            allowedRoles: ['sysadmin']
          },
          {
            name: 'Buscar usuarios',
            icon: 'fas fa-search fa-fw',
            url: null,
            allowedRoles: ['sysadmin']
          }
        ]
      },
      {
        name: 'Empresa',
        icon: 'fas fa-store-alt fa-fw',
        url: '/admin/user/company-profile/' + cmp_uuid,
        hasSubmenu: false,
        allowedRoles: ['admin']
      }
    ];

    this._sharedDataService.selectedCompany$.subscribe((company) => {
      if(company) {
        this.selectedCompany = company.cmp;
        if (this.selectedCompany && this.selectedCompany.roles) {
          // Extraer los nombres de los roles seleccionados
          const allowedRoles = this.selectedCompany.roles.map((role: any) => role.rol_name);
  
          // Filtrar la navegación basada en los roles permitidos
          this.filteredNavigation = this.filterNavigationByRoles(this.menuItems, allowedRoles);
        }
      }
    });
  }

  public toggleSubMenu(item: any) {
    item.isOpen = !item.isOpen;
  }

  public filterNavigationByRoles(navigation: any[], allowedRoles: string[]): any[] {
    return navigation
      .map((item) => {
        const newItem = { ...item };

        if (newItem.allowedRoles) {
          const isAllowed = newItem.allowedRoles.some((role: string) =>
            allowedRoles.includes(role)
          );

          if (!isAllowed) {
            return null;
          }
        }

        if (newItem.submenu) {
          newItem.submenu = this.filterNavigationByRoles(newItem.submenu, allowedRoles);
          if (newItem.submenu.length === 0) {
            delete newItem.submenu;
          }
        }

        return newItem;
      })
      .filter((item) => item !== null);
  }
}
