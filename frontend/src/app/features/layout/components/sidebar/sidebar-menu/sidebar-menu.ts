import { Component, HostListener, inject } from '@angular/core';
import { SidebarSubmenu } from "../sidebar-submenu/sidebar-submenu";
import { Plus, Minus, LucideAngularModule } from 'lucide-angular';
import { MenuService } from '../../../services/menu.service';
import { SubMenuItem } from '../../../types/sub-menu-item';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  imports: [
    SidebarSubmenu,
    NgClass,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css'
})
export class SidebarMenu {
  public menuService = inject(MenuService);
  public plusIcon = Plus;
  public minusIcon = Minus;

  public toggleMenu(subMenu: SubMenuItem) {
    if (!this.menuService.showSideBar) {
      this.menuService.toggleDropdown(subMenu);
    } else {
      this.menuService.toggleMenu(subMenu);
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.menuService.showSideBar) {
      const target = event.target as HTMLElement;
      const clickedInsideDropdown = target.closest('.sidebar-dropdown') ||
                                   target.closest('[data-dropdown-trigger]');

      if (!clickedInsideDropdown) {
        this.menuService.closeAllDropdowns();
      }
    }
  }
}
