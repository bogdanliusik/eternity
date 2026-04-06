import { CdkOverlayOrigin, ConnectedPosition, Overlay, OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { Component, inject, QueryList, ViewChildren } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule,Minus, Plus } from 'lucide-angular';

import { MenuService } from '../../../services/menu.service';
import { SubMenuItem } from '../../../types/sub-menu-item';
import { SidebarSubmenu } from '../sidebar-submenu/sidebar-submenu';

@Component({
  selector: 'app-sidebar-menu',
  imports: [SidebarSubmenu, NgClass, RouterLink, RouterLinkActive, LucideAngularModule, OverlayModule],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css'
})
export class SidebarMenu {
  @ViewChildren(CdkOverlayOrigin, { read: CdkOverlayOrigin })
  private triggers!: QueryList<CdkOverlayOrigin>;
  private overlay = inject(Overlay);

  public menuService = inject(MenuService);
  public plusIcon = Plus;
  public minusIcon = Minus;
  public repositionsStrategy = this.overlay.scrollStrategies.reposition();

  public toggleMenu(subMenu: SubMenuItem) {
    if (!this.menuService.showSideBar) {
      this.menuService.toggleDropdown(subMenu);
    } else {
      this.menuService.toggleMenu(subMenu);
    }
  }

  overlayPositions = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 }
  ] as const satisfies ConnectedPosition[];

  onOverlayOutsideClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target) {
      this.menuService.closeAllDropdowns();
      return;
    }
    const clickedOnAnyTrigger = this.triggers?.toArray().some((t) => t.elementRef.nativeElement.contains(target));
    if (clickedOnAnyTrigger) {
      return;
    }
    this.menuService.closeAllDropdowns();
  }
}
