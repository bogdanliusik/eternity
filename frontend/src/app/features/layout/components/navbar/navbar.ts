import { Component, inject } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { ProfileMenu } from './profile-menu/profile-menu';
import { Menu, LucideAngularModule } from 'lucide-angular';
import { NavbarMobile } from './navbar-mobile/navbar-mobile';

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
