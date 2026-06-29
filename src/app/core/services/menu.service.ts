import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, switchMap } from 'rxjs';
import { SessionService } from './session.service';
import { AppMenusService } from './app-menus.service';

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
  badge?: number | string;
  badgeType?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  mnu_cod?: string | null;
  mnu_dashboardicon?: string | null;
  mnu_dashboardtitle?: string | null;
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

  // Items base del sidebar (ahora cargados dinámicamente)
  private sidebarItems: MenuItem[] = [];

  private filteredSidebarItems = new BehaviorSubject<MenuItem[]>([]);
  private filteredDashboardItems = new BehaviorSubject<DashboardItem[]>([]);

  constructor(
    private _sessionService: SessionService,
    private _appMenusService: AppMenusService
  ) { }

  // Mapear recursivamente el menú de la base de datos a MenuItem del sidebar
  private mapDatabaseMenuToMenuItem(dbMenu: any): MenuItem {
    const hasSubmenu = dbMenu.items && dbMenu.items.length > 0;
    const allowedRoles = !dbMenu.per_uuid ? ['*'] : (dbMenu.allowedRoles || []);

    return {
      id: dbMenu.mnu_uuid,
      name: dbMenu.mnu_title,
      icon: dbMenu.mnu_icon || undefined,
      hasSubmenu: hasSubmenu,
      isOpen: false,
      url: dbMenu.mnu_route || null,
      allowedRoles: allowedRoles,
      appPermission: dbMenu.appPermission || null,
      mnu_cod: dbMenu.mnu_cod || null,
      submenu: hasSubmenu ? dbMenu.items.map((child: any) => this.mapDatabaseMenuToMenuItem(child)) : undefined
    };
  }

  // Inicializar con datos del usuario
  public initialize(userRoles: string[], company: string): void {
    this.currentUserRoles = userRoles;
    this.currentCompany = company;

    // Cargar los items de menú de la base de datos de manera dinámica
    this._appMenusService.getMenuItemsTree().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.sidebarItems = response.data.map(item => this.mapDatabaseMenuToMenuItem(item));
          this.updateSidebarItems();
        }
      },
      error: (err) => {
        console.error('Error al inicializar sidebarItems dinámicamente:', err);
      }
    });
  }

  // Método para obtener los items del sidebar con URLs actualizadas
  private getSidebarItemsWithUpdatedUrls(): MenuItem[] {
    return this.sidebarItems.map(item => {
      // Si es el item de Empresa, actualizar la URL con la compañía actual
      if ((item.appPermission === 'menu.empresa' || item.url === '/admin/user/company-profile') && this.currentCompany) {
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

  // Actualizar items del dashboard cargando la plantilla desde la base de datos de manera dinámica y asíncrona
  public updateDashboardItems(dashboardData: any, cmp_uuid: string): Observable<DashboardItem[]> {
    return this.getUserRoles(cmp_uuid).pipe(
      switchMap(userRoles => {
        this.currentUserRoles = userRoles;
        this.currentCompany = cmp_uuid;

        // Actualizar sidebar con la nueva compañía
        this.updateSidebarItems();

        return this._appMenusService.getDashboardMenuItems().pipe(
          map(response => {
            const dbItems = response.data || [];
            
            const dataObj = Array.isArray(dashboardData) ? (dashboardData[0] || {}) : (dashboardData || {});
            const dashboardItems = dbItems.map((dbMenu: any) => {
              const dataKey = this.getDataKey(dbMenu.mnu_title);
              const count = dataObj[dataKey] || 0;

              let url = dbMenu.mnu_route || '';
              if (dbMenu.mnu_cod === 'menu.empresa' || url === '/admin/user/company-profile') {
                url = `/admin/user/company-profile/${cmp_uuid}`;
              }

              return {
                name: dbMenu.mnu_title,
                title: dbMenu.mnu_dashboardtitle || dbMenu.mnu_title,
                icon: dbMenu.mnu_dashboardicon || dbMenu.mnu_icon || 'fas fa-th-large fa-fw',
                url: url,
                description: `${count} Registrados`,
                allowedRoles: !dbMenu.per_uuid ? ['*'] : (dbMenu.allowedRoles || [])
              };
            });

            const filteredItems = this.filterDashboardItemsByRoles(dashboardItems, userRoles);
            this.filteredDashboardItems.next(filteredItems);
            return filteredItems;
          })
        );
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



  // Helper para mapear nombres a keys de datos
  private getDataKey(itemName: string): string {
    const cleanName = (itemName || '').trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita acentos/diacríticos

    const mapping: { [key: string]: string } = {
      'clientes': 'customersCount',
      'lista de clientes': 'customersCount',
      'items': 'itemsCount',
      'modelo items': 'modelsItemsCount',
      'trabajos': 'worksCount',
      'usuarios': 'usersCount',
      'empresa': 'companiesCount'
    };

    return mapping[cleanName] || `${cleanName}Count`;
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

    if (item.companies) {
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