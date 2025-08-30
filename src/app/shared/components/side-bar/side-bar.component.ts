import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  
  public menuItems = [
    {
      name: 'Dashboard',
      icon: 'fab fa-dashcube fa-fw',
      hasSubmenu: false,
      url: 'dashboard'
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
          url: '/admin/user/customer/new'
        },
        { 
          name: 'Lista de clientes',
          icon: 'fas fa-clipboard-list fa-fw',
          url: 'customers'
        },
        {
          name: 'Buscar cliente',
          icon: 'fas fa-search fa-fw',
          url: null
        }
      ]
    },
    {
      name: 'Items',
      icon: 'fas fa-pallet fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Agregar item',
          icon: 'fas fa-plus fa-fw',
          url: null
        },
        { 
          name: 'Lista de items',
          icon: 'fas fa-clipboard-list fa-fw',
          url: null
        },
        {
          name: 'Buscar item',
          icon: 'fas fa-search fa-fw',
          url: null
        }
      ]
    },
    {
      name: 'Préstamos',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      url: null,
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Nuevo préstamo',
          icon: 'fas fa-plus fa-fw',
          url: null
        },
        { 
          name: 'Lista de préstamos',
          icon: 'fas fa-clipboard-list fa-fw',
          url: null
        },
        {
          name: 'Buscar préstamos',
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
          url: null
        },
        { 
          name: 'Lista de usuarios',
          icon: 'fas fa-clipboard-list fa-fw',
          url: null
        },
        {
          name: 'Buscar usuarios',
          icon: 'fas fa-search fa-fw',
          url: null
        }
      ]
    },
    {
      name: 'Empresa',
      icon: 'fas fa-store-alt fa-fw',
      url: null,
      hasSubmenu: false
    }
  ];

  public toggleSubMenu(item: any) {
    item.isOpen = !item.isOpen;
  }
}
