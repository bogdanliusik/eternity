import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';
import { AuthStore } from '@/core/auth/auth.store';
import { AdministrationStore } from '@/core/administration/administration.store';
import { MenuService } from './services/menu.service';
import { ThemeService } from '@/core/themes/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly adminStore = inject(AdministrationStore);
  private readonly menuService = inject(MenuService);
  private readonly themeService = inject(ThemeService);

  readonly contentClass = computed(() =>
    this.themeService.theme().fullWidth
      ? 'mx-auto px-4 py-4 sm:px-8'
      : 'mx-auto px-4 py-4 sm:px-8 2xl:container'
  );

  ngOnInit() {
    this.menuService.refreshMenu();
    const user = this.authStore.user();
    const isAdmin = user?.roles?.includes('Admin') ?? false;
    if (isAdmin) {
      this.adminStore.loadInitialData();
    }
  }
}
