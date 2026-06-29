import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PageNavTabsComponent } from '../../../shared/components/page-nav-tabs/page-nav-tabs.component';
import { MenuInterface } from '../../../core/interfaces/menu/menu.interface';
import { AppMenusService } from '../../../core/services/app-menus.service';
import { MessageService } from '../../../core/services/message.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PermissionsService } from '../../../core/services/permissions.service';

@Component({
  selector: 'app-menu-item',
  imports: [
    RouterLink,
    FormsModule,
    HeaderComponent,
    PageNavTabsComponent,
    NzSelectModule
  ],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent implements OnInit {

  public menu!: MenuInterface;
  public parentMenus: MenuInterface[] = [];
  public permissions: any[] = [];
  public isLoading: boolean = false;
  public headerConfig: any = {};
  
  public dataTabs: any = [
    {
      url: ['/admin/application/menu-item', 'new'],
      icon: "fas fa-plus fa-fw",
      title: "AGREGAR MENU"
    },
    {
      url: ['/admin/application/menu-items'],
      icon: "fas fa-clipboard-list fa-fw",
      title: "LISTA DE MENUS"
    }
  ];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _messageService: MessageService,
    private _appMenusService: AppMenusService,
    private _permissionsService: PermissionsService
  ) {
    this.menuInit();
  }

  ngOnInit(): void {
    this.getParentMenus();
    this.getPermissions();

    this._route.params.subscribe((params) => {
      if (params['mnu_uuid'] && params['mnu_uuid'] !== 'new') {
        this.headerConfig = {
          title: "ACTUALIZAR MENU",
          description: "Ficha para actualizar un elemento de menú.",
          icon: "fas fa-sync-alt fa-fw"
        };
        this.menu.mnu_uuid = params['mnu_uuid'];
        this.getMenuById(params['mnu_uuid']);
      } else {
        this.headerConfig = {
          title: "AGREGAR MENU",
          description: "Ficha para agregar un elemento de menú.",
          icon: "fas fa-plus fa-fw"
        };
      }
    });
  }

  public menuInit(): void {
    this.menu = {
      mnu_uuid: 'new',
      mnu_parent_uuid: '',
      mnu_cod: '',
      mnu_title: '',
      mnu_description: '',
      mnu_icon: '',
      mnu_route: '',
      mnu_order: 0,
      mnu_itemactive: true,
      mnu_active: true,
      mnu_showifcompanyactive: false,
      mnu_createdat: null,
      mnu_updatedat: null,
      per_uuid: '',
      mnu_dashboardicon: '',
      mnu_showondashboard: false,
      mnu_dashboardtitle: ''
    };
  }

  private getParentMenus(): void {
    this._appMenusService.getMenus().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Excluimos el propio menú para evitar auto-referencia, pero permitimos cualquier nivel como padre
          this.parentMenus = response.data.filter(m => m.mnu_uuid !== this.menu.mnu_uuid);
        }
      },
      error: (err) => {
        console.error("Error al obtener menús padres:", err);
      }
    });
  }

  private getPermissions(): void {
    this._permissionsService.getPermissions().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.permissions = response.data;
        }
      },
      error: (err) => {
        console.error("Error al obtener lista de permisos:", err);
      }
    });
  }

  private getMenuById(mnu_uuid: string): void {
    this._appMenusService.getMenuById(mnu_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.menu = response.data;
          // Volvemos a filtrar los padres para excluir al elemento actual
          this.parentMenus = this.parentMenus.filter(m => m.mnu_uuid !== this.menu.mnu_uuid);
        }
      },
      error: (err) => {
        console.error("Error al obtener menú:", err);
        this._messageService.error("Error", "No se pudo recuperar el elemento de menú.");
      }
    });
  }

  private validate(): boolean {
    if (!this.menu.mnu_title) {
      this._messageService.error("Error", "El título del menú es obligatorio.");
      return false;
    }
    if (this.menu.mnu_title.length > 255) {
      this._messageService.error("Error", "El título no puede superar los 255 caracteres.");
      return false;
    }
    if (this.menu.mnu_order === undefined || this.menu.mnu_order === null) {
      this._messageService.error("Error", "El orden es obligatorio.");
      return false;
    }
    return true;
  }

  public onSaveMenu(formMenu: NgForm): void {
    if (!this.validate()) return;

    this.isLoading = true;
    const payload = { ...this.menu };
    // Si mnu_parent_uuid es vacío, lo enviamos como null para evitar problemas en base de datos
    if (!payload.mnu_parent_uuid) {
      payload.mnu_parent_uuid = null;
    }
    if (!payload.per_uuid) {
      payload.per_uuid = null;
    }
    if (!payload.mnu_dashboardicon) {
      payload.mnu_dashboardicon = null;
    }
    if (!payload.mnu_dashboardtitle) {
      payload.mnu_dashboardtitle = null;
    }

    if (this.menu.mnu_uuid && this.menu.mnu_uuid !== 'new') {
      this.updateMenu(payload);
    } else {
      this.insertMenu(payload);
    }
  }

  private updateMenu(menu: any): void {
    this._appMenusService.updateMenu(menu).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this._messageService.success(
            "Información",
            "El Menú fue actualizado correctamente.",
            () => {
              this._router.navigate(['/admin/application/menu-items']);
            }
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error al actualizar menú:", err);
        this._messageService.error("Error", err.error.error || "Ocurrió un error al actualizar el menú.");
      }
    });
  }

  private insertMenu(menu: any): void {
    // Quitamos la propiedad mnu_uuid para que el backend la genere
    const { mnu_uuid, ...newMenu } = menu;

    this._appMenusService.saveMenu(newMenu).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this._messageService.success(
            "Información",
            "El Menú fue agregado correctamente.",
            () => {
              this._router.navigate(['/admin/application/menu-items']);
            }
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error al guardar menú:", err);
        this._messageService.error("Error", err.error.error || "Ocurrió un error al guardar el menú.");
      }
    });
  }
}
