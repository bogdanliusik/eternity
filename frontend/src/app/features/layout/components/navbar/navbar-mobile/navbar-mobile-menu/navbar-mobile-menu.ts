import { Component, inject } from '@angular/core';
import { NavbarMobileSubmenu } from '../navbar-mobile-submenu/navbar-mobile-submenu';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from '@/features/layout/services/menu.service';
import { SubMenuItem } from '@/features/layout/types/sub-menu-item';
import { LucideAngularModule, Minus, Plus } from 'lucide-angular';

@Component({
  selector: 'app-navbar-mobile-menu',
  templateUrl: './navbar-mobile-menu.html',
  styleUrl: './navbar-mobile-menu.css',
  imports: [
    LucideAngularModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    NavbarMobileSubmenu,
  ]
})
export class NavbarMobileMenu {
  public plusIcon = Plus;
  public minusIcon = Minus;
  public readonly menuService = inject(MenuService);

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }

  public closeMenu() {
    this.menuService.showMobileMenu = false;
  }
}
