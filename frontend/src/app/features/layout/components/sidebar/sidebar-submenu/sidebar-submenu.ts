import { Component, inject, Input } from '@angular/core';
import { SubMenuItem } from '../../../types/sub-menu-item';
import { MenuService } from '../../../services/menu.service';
import { Plus, Minus, LucideAngularModule } from 'lucide-angular';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-sidebar-submenu',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, LucideAngularModule],
  templateUrl: './sidebar-submenu.html',
  styleUrl: './sidebar-submenu.css'
})
export class SidebarSubmenu {
  public menuService = inject(MenuService);
  @Input() public submenu = <SubMenuItem>{};
  public plusIcon = Plus;
  public minusIcon = Minus;

  public toggleMenu(menu: any) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }
}
