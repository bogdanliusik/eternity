import { MenuService } from '@/features/layout/services/menu.service';
import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarMobileMenu } from './navbar-mobile-menu/navbar-mobile-menu';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LucideAngularModule, XIcon } from 'lucide-angular';

@Component({
  selector: 'app-navbar-mobile',
  templateUrl: './navbar-mobile.html',
  styleUrl: './navbar-mobile.css',
  imports: [NgClass, NavbarMobileMenu, LucideAngularModule, AngularSvgIconModule],
})
export class NavbarMobile {
  public xIcon = XIcon;
  public readonly menuService = inject(MenuService);

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}
