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
  appPermission?: string | null;
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
      name: 'Configuración',
      icon: 'fas fa-cog fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['sysadmin'],
      appPermission: 'menu.configuracion',
      submenu: [
        { 
          id: '11',
          name: 'Permisos',
          icon: 'fas fa-key fa-fw',
          url: null,
          hasSubmenu: true,
          isOpen: false,
          appPermission: 'menu.configuracion.permisos',
          submenu: [
            { 
              id: '111',
              name: 'Agregar permiso',
              icon: 'fas fa-plus fa-fw',
              url: ['/admin/application/permission/new', ''],
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos.agregar_permiso'
            },
            { 
              id: '112',
              name: 'Lista de permisos',
              icon: 'fas fa-clipboard-list fa-fw',
              url: '/admin/application/permissions',
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos.lista_permiso'
            },
            {
              id: '113',
              name: 'Buscar permiso',
              icon: 'fas fa-search fa-fw',
              url: null,
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos.buscar_permiso'
            }
          ],
          allowedRoles: ['sysadmin']
        },
        { 
          id: '12',
          name: 'Permisos de roles',
          icon: 'fas fa-key fa-fw',
          url: null,
          hasSubmenu: true,
          isOpen: false,
          appPermission: 'menu.configuracion.permisos_de_roles',
          submenu: [
            { 
              id: '121',
              name: 'Agregar permiso de rol',
              icon: 'fas fa-plus fa-fw',
              url: ['/admin/application/rol-permission/new', ''],
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos_de_roles.agregar_permiso_de_rol'
            },
            { 
              id: '122',
              name: 'Lista de permisos de roles',
              icon: 'fas fa-clipboard-list fa-fw',
              url: '/admin/application/rol-permissions',
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos_de_roles.lista_de_permisos_de_rol'
            },
            {
              id: '123',
              name: 'Buscar permiso de rol',
              icon: 'fas fa-search fa-fw',
              url: null,
              allowedRoles: ['sysadmin'],
              appPermission: 'menu.configuracion.permisos_de_roles.buscar_permisos_de_rol'
            }
          ],
          allowedRoles: ['sysadmin']
        }
      ]
    },
    {
      id: '2',
      name: 'Dashboard',
      icon: 'fab fa-dashcube fa-fw',
      hasSubmenu: false,
      url: '/admin/user/dashboard',
      allowedRoles: ['sysadmin', 'admin', 'editor'],
      appPermission: 'menu.dashboard'
    },
    {
      id: '3',
      name: 'Recorridos',
      icon: 'fas fa-route fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin', 'viewer', 'editor'],
      appPermission: 'menu.recorridos',
      submenu: [
        { 
          id: '31',
          name: 'Agregar Recorrido',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/user/route/new',
          allowedRoles: ['admin'],
          appPermission: 'menu.recorridos.agregar_recorrido'
        },
        { 
          id: '32',
          name: 'Lista de recorridos',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'routes',
          allowedRoles: ['admin', 'viewer'],
          appPermission: 'menu.recorridos.listar_recorridos'
        },
        {
          id: '33',
          name: 'Buscar recorrido',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin', 'editor'],
          appPermission: 'menu.recorridos.buscar_recorrido'
        }
      ]
    },
    {
      id: '4',
      name: 'Clientes',
      icon: 'fas fa-users fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin', 'viewer', 'editor'],
      appPermission: 'menu.clientes',
      submenu: [
        { 
          id: '41',
          name: 'Agregar Cliente',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/user/customer/new',
          allowedRoles: ['admin'],
          appPermission: 'menu.clientes.agregar_cliente'
        },
        { 
          id: '42',
          name: 'Lista de clientes',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'customers',
          allowedRoles: ['admin', 'viewer'],
          appPermission: 'menu.clientes.listar_clientes'
        },
        {
          id: '43',
          name: 'Buscar cliente',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin', 'editor'],
          appPermission: 'menu.clientes.buscar_cliente'
        }
      ]
    },
    {
      id: '5',
      name: 'Items',
      icon: 'fas fa-pallet fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['sysadmin'],
      appPermission: 'menu.items',
      submenu: [
        { 
          id: '51',
          name: 'Agregar item',
          icon: 'fas fa-plus fa-fw',
          url: null,
          allowedRoles: ['sysadmin'],
          appPermission: 'menu.items.agregar_item'
        },
        { 
          id: '52',
          name: 'Lista de items',
          icon: 'fas fa-clipboard-list fa-fw',
          url: '/admin/application/items',
          allowedRoles: ['sysadmin'],
          appPermission: 'menu.items.lista_items'
        },
        {
          id: '53',
          name: 'Buscar item',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['sysadmin'],
          appPermission: 'menu.items.buscar_item'
        }
      ]
    },
    {
      id: '6',
      name: 'Modelo Items',
      icon: 'fas fa-pallet fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin'],
      appPermission: 'menu.modelo_items',
      submenu: [
        { 
          id: '61',
          name: 'Agregar modelo item',
          icon: 'fas fa-plus fa-fw',
          url: ['/admin/user/model-item/new', '', ''],
          allowedRoles: ['admin'],
          appPermission: 'menu.modelo_items.agregar_modelo_item'
        },
        { 
          id: '62',
          name: 'Lista de modelo items',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'models-items',
          allowedRoles: ['admin'],
          appPermission: 'menu.modelo_items.listar_modelo_items'
        },
        {
          id: '63',
          name: 'Buscar modelo item',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin'],
          appPermission: 'menu.modelo_items.buscar_modelo_item'
        }
      ]
    },
    {
      id: '7',
      name: 'Trabajos',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['admin', 'viewer', 'editor'],
      appPermission: 'menu.trabajos',
      submenu: [
        { 
          id: '71',
          name: 'Nuevo trabajo',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/user/work/new',
          allowedRoles: ['admin'],
          appPermission: 'menu.trabajos.nuevo_trabajo'
        },
        { 
          id: '72',
          name: 'Lista de trabajos',
          icon: 'fas fa-clipboard-list fa-fw',
          url: '/admin/user/works',
          allowedRoles: ['admin', 'viewer', 'editor'],
          appPermission: 'menu.trabajos.listar_trabajos'
        },
        {
          id: '73',
          name: 'Buscar trabajos',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['admin', 'viewer', 'editor'],
          appPermission: 'menu.trabajos.buscar_trabajo'
        }
      ]
    },
    {
      id: '8',
      name: 'Usuarios',
      icon: 'fas fa-user-secret fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      allowedRoles: ['sysadmin', 'admin'],
      appPermission: 'menu.usuarios',
      submenu: [
        { 
          id: '81',
          name: 'Nuevo usuario',
          icon: 'fas fa-plus fa-fw',
          url: '/admin/application/user/new',
          allowedRoles: ['sysadmin', 'admin'],
          appPermission: 'menu.usuarios.nuevo_usuario'
        },
        { 
          id: '82',
          name: 'Lista de usuarios',
          icon: 'fas fa-clipboard-list fa-fw',
          url: '/admin/application/users',
          allowedRoles: ['sysadmin'],
          appPermission: 'menu.usuarios.lista_usuarios'
        },
        {
          id: '83',
          name: 'Buscar usuarios',
          icon: 'fas fa-search fa-fw',
          url: null,
          allowedRoles: ['sysadmin'],
          appPermission: 'menu.usuarios.buscar_usuarios'
        }
      ]
    },
    {
      id: '9',
      name: 'Empresa',
      icon: 'fas fa-store-alt fa-fw',
      url: null, // URL se establecerá dinámicamente
      hasSubmenu: false,
      allowedRoles: ['sysadmin', 'admin'],
      appPermission: 'menu.empresa'
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
  
  // Método para obtener los items del sidebar con URLs actualizadas
  private getSidebarItemsWithUpdatedUrls(): MenuItem[] {
    return this.sidebarItems.map(item => {
      // Si es el item de Empresa, actualizar la URL
      if (item.id === '7' && this.currentCompany) {
        return {
          ...item,
          url: `/admin/user/company-profile/${this.currentCompany}`
        };
      }
      return item;
    });
  }

  // Actualizar items del sidebar con URLs correctas
  private updateSidebarItems(): void {
    const itemsWithUpdatedUrls = this.getSidebarItemsWithUpdatedUrls();
    const filteredSidebar = this.filterItemsByRoleAndCompany(itemsWithUpdatedUrls);
    this.filteredSidebarItems.next(filteredSidebar);
  }

  // Método actualizado: ahora devuelve Observable
  public updateDashboardItems(dashboardData: any, cmp_uuid: string): Observable<DashboardItem[]> {
    return this.getUserRoles(cmp_uuid).pipe(
      map(userRoles => {
        this.currentUserRoles = userRoles;
        this.currentCompany = cmp_uuid;
        
        // Actualizar sidebar con la nueva compañía
        this.updateSidebarItems();
        
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