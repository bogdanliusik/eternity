import { Component, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../services/menu.service';
import { ChevronsLeft, LucideAngularModule } from 'lucide-angular';
import { SidebarMenu } from "./sidebar-menu/sidebar-menu";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgClass,
    AngularSvgIconModule,
    LucideAngularModule,
    SidebarMenu
  ],
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
