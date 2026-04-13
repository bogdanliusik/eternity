import { effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AdministrationStore } from '@/core/administration/administration.store';
import { AuthStore } from '@/core/auth/auth.store';

import { Menu, MENU_ITEM_IDS } from '../constants/menu';
import { MenuItem } from '../types/menu-item';
import { SubMenuItem } from '../types/sub-menu-item';

@Injectable({
  providedIn: 'root'
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  private readonly authStore = inject(AuthStore);
  private readonly adminStore = inject(AdministrationStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const count = this.adminStore.registrationRequestsCount();
      untracked(() => {
        this.updateBadgeCount(MENU_ITEM_IDS.REGISTRATION_REQUESTS, count);
      });
    });
    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._pagesMenu().forEach((menu) => {
          let activeGroup = false;
          menu.items.forEach((subMenu) => {
            const active = this.isActive(subMenu.route) || this.matchesAdditionalRoutes(subMenu);
            subMenu.expanded = active;
            subMenu.active = active;
            if (active) activeGroup = true;
            if (subMenu.children) {
              this.expand(subMenu.children);
            }
          });
          menu.active = activeGroup;
        });
      }
    });
    this._subscription.add(sub);
  }

  get showSideBar() {
    return this._showSidebar();
  }
  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }

  get showMobileMenu() {
    return this._showMobileMenu();
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  get pagesMenu() {
    return this._pagesMenu();
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: SubMenuItem) {
    this.showSideBar = true;
    const updatedMenu = this._pagesMenu().map((menuGroup) => {
      return {
        ...menuGroup,
        items: menuGroup.items.map((item) => {
          return {
            ...item,
            expanded: item === menu ? !item.expanded : false
          };
        })
      };
    });
    this._pagesMenu.set(updatedMenu);
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private expand(items: SubMenuItem[]) {
    items.forEach((item) => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  public isActive(instruction: string | null | undefined): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  private matchesAdditionalRoutes(item: SubMenuItem): boolean {
    if (!item.additionalActiveRoutes?.length) return false;
    const url = this.router.url.split('?')[0];
    return item.additionalActiveRoutes.some((prefix) => url.startsWith(prefix));
  }

  private initializeMenu() {
    const userRoles = this.authStore.user()?.roles ?? [];
    const filteredMenu = this.filterMenuByRoles(Menu.pages, userRoles);
    this._pagesMenu.set(filteredMenu);
  }

  private filterMenuByRoles(menu: MenuItem[], userRoles: string[]): MenuItem[] {
    return menu
      .filter((group) => {
        if (!group.roles || group.roles.length === 0) {
          return true;
        }
        return group.roles.some((role) => userRoles.includes(role));
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.roles || item.roles.length === 0) {
            return true;
          }
          return item.roles.some((role) => userRoles.includes(role));
        })
      }))
      .filter((group) => group.items.length > 0);
  }

  public updateBadgeCount(badgeId: string, count: number) {
    const updatedMenu = this._pagesMenu().map((menuGroup) => ({
      ...menuGroup,
      items: menuGroup.items.map((item) => {
        if (item.badge === badgeId) {
          return { ...item, badgeCount: count };
        }
        return item;
      })
    }));
    this._pagesMenu.set(updatedMenu);
  }

  public refreshMenu() {
    this.initializeMenu();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
