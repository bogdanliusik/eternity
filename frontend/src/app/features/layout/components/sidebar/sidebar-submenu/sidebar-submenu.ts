import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule,Minus, Plus } from 'lucide-angular';

import { MenuService } from '../../../services/menu.service';
import { SubMenuItem } from '../../../types/sub-menu-item';

@Component({
  selector: 'app-sidebar-submenu',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, LucideAngularModule],
  templateUrl: './sidebar-submenu.html',
  styleUrl: './sidebar-submenu.css'
})
export class SidebarSubmenu {
  public menuService = inject(MenuService);
  @Input() public submenu = {} as SubMenuItem;
  public plusIcon = Plus;
  public minusIcon = Minus;

  public toggleMenu(menu: SubMenuItem) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: SubMenuItem[]) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }
}
