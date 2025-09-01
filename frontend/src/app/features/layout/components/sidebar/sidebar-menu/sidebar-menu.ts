import { Component, HostListener, inject } from '@angular/core';
import { SidebarSubmenu } from '../sidebar-submenu/sidebar-submenu';
import { Plus, Minus, LucideAngularModule } from 'lucide-angular';
import { MenuService } from '../../../services/menu.service';
import { SubMenuItem } from '../../../types/sub-menu-item';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConnectedPosition, Overlay, OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-sidebar-menu',
  imports: [SidebarSubmenu, NgClass, RouterLink, RouterLinkActive, LucideAngularModule, OverlayModule],
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

  private overlay = inject(Overlay);

  overlayPositions = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 }
  ] as const satisfies ConnectedPosition[];

  scrollStrategies = {
    reposition: this.overlay.scrollStrategies.reposition()
  };
}
