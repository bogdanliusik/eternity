import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Minus, Plus } from 'lucide-angular';

import { MenuService } from '@/features/layout/services/menu.service';
import { SubMenuItem } from '@/features/layout/types/sub-menu-item';

@Component({
  selector: 'app-navbar-mobile-submenu',
  templateUrl: './navbar-mobile-submenu.html',
  styleUrl: './navbar-mobile-submenu.css',
  imports: [NgTemplateOutlet, RouterLinkActive, RouterLink, LucideAngularModule]
})
export class NavbarMobileSubmenu {
  public plusIcon = Plus;
  public minusIcon = Minus;
  public readonly menuService = inject(MenuService);

  @Input() public submenu = {} as SubMenuItem;

  public toggleMenu(menu: SubMenuItem) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: SubMenuItem[]) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }

  public closeMobileMenu() {
    this.menuService.showMobileMenu = false;
  }
}
