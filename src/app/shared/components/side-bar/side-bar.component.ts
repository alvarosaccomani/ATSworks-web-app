import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [
    CommonModule
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  
  public menuItems = [
    {
      name: 'Dashboard',
      icon: 'fab fa-dashcube fa-fw',
      hasSubmenu: false
    },
    {
      name: 'Clientes',
      icon: 'fas fa-users fa-fw',
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Agregar Cliente',
          icon: 'fas fa-plus fa-fw'
        },
        { 
          name: 'Lista de clientes',
          icon: 'fas fa-clipboard-list fa-fw'
        },
        {
          name: 'Buscar cliente',
          icon: 'fas fa-search fa-fw'
        }
      ]
    },
    {
      name: 'Items',
      icon: 'fas fa-pallet fa-fw',
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Agregar item',
          icon: 'fas fa-plus fa-fw'
        },
        { 
          name: 'Lista de items',
          icon: 'fas fa-clipboard-list fa-fw'
        },
        {
          name: 'Buscar item',
          icon: 'fas fa-search fa-fw'
        }
      ]
    },
    {
      name: 'Préstamos',
      icon: 'fas fa-file-invoice-dollar fa-fw',
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Nuevo préstamo',
          icon: 'fas fa-plus fa-fw'
        },
        { 
          name: 'Lista de préstamos',
          icon: 'fas fa-clipboard-list fa-fw'
        },
        {
          name: 'Buscar préstamos',
          icon: 'fas fa-search fa-fw'
        }
      ]
    },
    {
      name: 'Usuarios',
      icon: 'fas fa-user-secret fa-fw',
      hasSubmenu: true,
      isOpen: false,
      submenu: [
        { 
          name: 'Nuevo usuario',
          icon: 'fas fa-plus fa-fw'
        },
        { 
          name: 'Lista de usuarios',
          icon: 'fas fa-clipboard-list fa-fw'
        },
        {
          name: 'Buscar usuarios',
          icon: 'fas fa-search fa-fw'
        }
      ]
    },
    {
      name: 'Empresa',
      icon: 'fas fa-store-alt fa-fw',
      hasSubmenu: false
    }
  ];

  public toggleSubMenu(item: any) {
    item.isOpen = !item.isOpen;
  }
}
