import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Minus, Plus } from 'lucide-angular';

import { MenuService } from '../../../services/menu.service';
import { SidebarSubmenu } from '../sidebar-submenu/sidebar-submenu';

@Component({
  selector: 'app-sidebar-menu',
  imports: [SidebarSubmenu, NgClass, RouterLink, RouterLinkActive, LucideAngularModule, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css'
})
export class SidebarMenu {
  public menuService = inject(MenuService);
  public plusIcon = Plus;
  public minusIcon = Minus;

  menuPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 }
  ];
}
