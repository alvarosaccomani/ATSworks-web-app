import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { SessionService } from './session.service';

export interface MenuItem {
  id: string;
  name: string;
  icon?: string;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  url?: string | string[] | null;
  allowedRoles: string[];
  companies?: string[];
  submenu?: MenuItem[];
  visible?: boolean;
}

export interface DashboardItem {
  name: string;
  title: string;
  icon: string;
  url: string;
  description: string;
  allowedRoles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private currentUserRoles: string[] = [];
  private currentCompany: string = '';

  // Items base del sidebar
  private sidebarItems: MenuItem[] = [
    {
      id: '1',
      name: 'Dashboard',
      icon: 'fab fa-dashcube fa-fw',
      hasSubmenu: false,
      url: 'dashboard',
      allowedRoles: ['sysadmin', 'admin', 'editor']
    },
    {
      id: '2',
      name: 'Clientes',
      icon: 'fas fa-users fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin', 'viewer', 'editor'],
      submenu: [
        { 
          id: '21',
          name: 'Agregar Cliente',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/user/customer/new',
          allowedRoles: ['admin']
        },
        { 
          id: '22',
          name: 'Lista de clientes',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'customers',
          allowedRoles: ['admin', 'viewer']
        },
        {
          id: '23',
          name: 'Buscar cliente',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin', 'editor']
        }
      ]
    },
    {
      id: '3',
      name: 'Items',
      icon: 'fas fa-pallet fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['sysadmin'],
      submenu: [
        { 
          id: '31',
          name: 'Agregar item',
          icon: 'fas fa-plus fa-fw',
          url: null,
          allowedRoles: ['sysadmin']
        },
        { 
          id: '32',
          name: 'Lista de items',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'items',
          allowedRoles: ['sysadmin']
        },
        {
          id: '33',
          name: 'Buscar item',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['sysadmin']
        }
      ]
    },
    {
      id: '4',
      name: 'Modelo Items',
      icon: 'fas fa-pallet fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin'],
      submenu: [
        { 
          id: '41',
          name: 'Agregar modelo item',
          icon: 'fas fa-plus fa-fw',
          url: ['/admin/user/model-item/new', '', ''],
          allowedRoles: ['admin']
        },
        { 
          id: '42',
          name: 'Lista de modelo items',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'models-items',
          allowedRoles: ['admin']
        },
        {
          id: '43',
          name: 'Buscar modelo item',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin']
        }
      ]
    },
    {
      id: '5',
      name: 'Trabajos',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin', 'viewer', 'editor'],
      submenu: [
        { 
          id: '51',
          name: 'Nuevo trabajo',
          icon: 'fas fa-plus fa-fw',
          url: 'work/new',
          allowedRoles: ['admin']
        },
        { 
          id: '52',
          name: 'Lista de trabajos',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'works',
          allowedRoles: ['admin', 'viewer', 'editor']
        },
        {
          id: '53',
          name: 'Buscar trabajos',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin', 'viewer', 'editor']
        }
      ]
    },
    {
      id: '6',
      name: 'Usuarios',
      icon: 'fas fa-user-secret fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['sysadmin', 'admin'],
      submenu: [
        { 
          id: '61',
          name: 'Nuevo usuario',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/application/user/new',
          allowedRoles: ['sysadmin', 'admin']
        },
        { 
          id: '62',
          name: 'Lista de usuarios',
          icon: 'fas fa-clipboard-list fa-fw',
          url: '/admin/application/users',
          allowedRoles: ['sysadmin']
        },
        {
          id: '63',
          name: 'Buscar usuarios',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['sysadmin']
        }
      ]
    },
    {
      id: '7',
      name: 'Empresa',
      icon: 'fas fa-store-alt fa-fw',
      url: '/admin/user/company-profile/' + this.currentCompany,
      hasSubmenu: false,
      allowedRoles: ['sysadmin', 'admin']
    }
  ];

  // Items base del dashboard (plantilla)
  private dashboardTemplate: any[] = [
    {
      id: '1',
      name: 'Clientes',
      title: 'Clientes',
      icon: 'fas fa-users fa-fw',
      url: '/admin/user/customers',
      description: '',
      allowedRoles: ['admin', 'editor']
    },
    {
      id: '2',
      name: 'Items',
      title: 'Items',
      icon: 'fas fa-pallet fa-fw',
      url: '/admin/application/items',
      description: '',
      allowedRoles: ['sysadmin']
    },
    {
      id: '3',
      name: 'Modelo Items',
      title: 'Modelo Items',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      url: '/admin/user/models-items',
      description: '',
      allowedRoles: ['admin']
    },
    {
      id: '4',
      name: 'Trabajos',
      title: 'Trabajos',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      url: '/admin/user/works',
      description: '',
      allowedRoles: ['admin', 'viewer', 'editor']
    },
    {
      id: '5',
      name: 'Usuarios',
      title: 'Usuarios',
      icon: 'fas fa-user-secret fa-fw',
      url: '/admin/application/users',
      description: '',
      allowedRoles: ['sysadmin', 'admin']
    },
    {
      id: '6',
      name: 'Empresa',
      title: 'Empresa',
      icon: 'fas fa-store-alt fa-fw',
      url: '',
      description: '',
      allowedRoles: ['sysadmin', 'admin']
    }
  ];
  
  private filteredSidebarItems = new BehaviorSubject<MenuItem[]>([]);
  private filteredDashboardItems = new BehaviorSubject<DashboardItem[]>([]);
  
  constructor(
    private _sessionService: SessionService
  ) { }

  // Inicializar con datos del usuario
  public initialize(userRoles: string[], company: string): void {
    this.currentUserRoles = userRoles;
    this.currentCompany = company;
    this.updateSidebarItems();
  }

  // Método actualizado: ahora devuelve Observable
  public updateDashboardItems(dashboardData: any, cmp_uuid: string): Observable<DashboardItem[]> {
    return this.getUserRoles(cmp_uuid).pipe(
      map(userRoles => {
        this.currentUserRoles = userRoles;
        this.currentCompany = cmp_uuid;
        
        const dashboardItems = this.buildDashboardItems(dashboardData, cmp_uuid);
        const filteredItems = this.filterDashboardItemsByRoles(dashboardItems, userRoles);
        
        // Actualizar el BehaviorSubject
        this.filteredDashboardItems.next(filteredItems);
        
        return filteredItems;
      })
    );
  }

  // Obtener roles del usuario desde localStorage
  private getUserRoles(cmp_uuid: string): Observable<string[]> {
    const company = this._sessionService.getCompany();
    if (company && company.roles) {
      // Extraer los nombres de los roles usando el algoritmo que proporcionaste
      const allowedRoles = company.roles.map((role: any) => role.rol_name);
      return of(allowedRoles);
    }
    
    // Si no hay roles, retornar array vacío
    return of([]);
  }

  // Filtrar items del dashboard por roles
  private filterDashboardItemsByRoles(dashboardItems: any[], userRoles: string[]): any[] {
    if (!userRoles || userRoles.length === 0) {
      return dashboardItems; // Si no hay roles, mostrar todos los items
    }

    return dashboardItems.filter(item => {
      // Si el item no tiene allowedRoles, mostrarlo a todos
      if (!item.allowedRoles) {
        return true;
      }
      
      // Verificar si el usuario tiene al menos uno de los roles permitidos
      return item.allowedRoles.some((allowedRole: string) => 
        userRoles.includes(allowedRole)
      );
    });
  }
  
  // Construir items del dashboard basado en los datos de la API
  private buildDashboardItems(dashboardData: any, cmp_uuid: string): DashboardItem[] {
    return this.dashboardTemplate
      .map(item => {
        // Buscar el dato correspondiente en la respuesta de la API
        const dataKey = this.getDataKey(item.name);
        const count = dashboardData[dataKey] || 0;
        
        // Construir la URL para la empresa
        let url = item.url;
        if (item.name === 'Empresa') {
          url = `/admin/user/company-profile/${cmp_uuid}`;
        }

        return {
          ...item,
          description: `${count} Registrados`,
          url: url
        };
      });
  }

  // Helper para mapear nombres a keys de datos
  private getDataKey(itemName: string): string {
    const mapping: {[key: string]: string} = {
      'Clientes': 'customersCount',
      'Items': 'itemsCount',
      'Modelo Items': 'modelsItemsCount',
      'Trabajos': 'worksCount',
      'Usuarios': 'usersCount',
      'Empresa': 'companiesCount'
    };
    
    return mapping[itemName] || `${itemName.toLowerCase()}Count`;
  }
    
  // Verificar acceso para items del dashboard
  private hasDashboardAccess(item: DashboardItem): boolean {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    
    return item.allowedRoles.some(role => 
      role === '*' || this.currentUserRoles.includes(role)
    );
  }

  // Actualizar items del sidebar
  private updateSidebarItems(): void {
    const filteredSidebar = this.filterItemsByRoleAndCompany(this.sidebarItems);
    this.filteredSidebarItems.next(filteredSidebar);
  }

  // Filtrar items por rol y empresa (para sidebar)
  private filterItemsByRoleAndCompany(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.hasAccess(item))
      .map(item => {
        if (item.submenu) {
          return {
            ...item,
            submenu: this.filterItemsByRoleAndCompany(item.submenu)
          };
        }
        return item;
      })
      .filter(item => !item.submenu || item.submenu.length > 0);
  }

  // Verificar si el usuario tiene acceso al item
  private hasAccess(item: MenuItem): boolean {
    const hasRoleAccess = item.allowedRoles.some(role => 
      this.currentUserRoles.includes(role) || role === '*'
    );
    
    if(item.companies) {
      const hasCompanyAccess = item.companies.some(company =>
        company === '*' || company === this.currentCompany
      );
      return hasRoleAccess && hasCompanyAccess;
    }

    return hasRoleAccess;
  }

  // Getters para los observables
  public getSidebarItems(): Observable<MenuItem[]> {
    return this.filteredSidebarItems.asObservable();
  }

  public getDashboardItems(): Observable<DashboardItem[]> {
    return this.filteredDashboardItems.asObservable();
  }

  // Método para obtener items filtrados del sidebar (para el SideBarComponent)
  public getFilteredSidebarItems(allowedRoles: string[]): Observable<MenuItem[]> {
    this.currentUserRoles = allowedRoles;
    this.updateSidebarItems();
    return this.filteredSidebarItems.asObservable();
  }

  // Actualizar datos del usuario
  public updateUserRoles(roles: string[]): void {
    this.currentUserRoles = roles;
    this.updateSidebarItems();
  }

  public updateCompany(company: string): void {
    this.currentCompany = company;
    this.updateSidebarItems();
  }
}