import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ChevronsLeft, LucideAngularModule } from 'lucide-angular';

import { MenuService } from '../../services/menu.service';
import { SidebarMenu } from './sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, AngularSvgIconModule, LucideAngularModule, SidebarMenu],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  public menuService = inject(MenuService);
  public chevronsLeftIcon = ChevronsLeft;

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
}
