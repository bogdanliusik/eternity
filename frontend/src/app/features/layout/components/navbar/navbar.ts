import { Component, inject } from '@angular/core';
import { LucideAngularModule,Menu } from 'lucide-angular';

import { MenuService } from '../../services/menu.service';
import { NavbarMobile } from './navbar-mobile/navbar-mobile';
import { ProfileMenu } from './profile-menu/profile-menu';

@Component({
  selector: 'app-navbar',
  imports: [ProfileMenu, LucideAngularModule, NavbarMobile],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  public readonly menuIcon = Menu;

  public menuService = inject(MenuService);

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}
