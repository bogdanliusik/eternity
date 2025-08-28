import { ThemeService } from '@/core/services/theme.service';
import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CircleUserRound,
  Settings,
  LogOut,
  Sun,
  Moon,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-profile-menu',
  imports: [
    ClickOutsideDirective,
    NgClass,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenu {
  public readonly sunIcon = Sun;
  public readonly moonIcon = Moon;

  public readonly themeService = inject(ThemeService);

  public isOpen = false;

  public profileMenu = [
    {
      title: 'Your Profile',
      icon: CircleUserRound,
      link: '/profile',
    },
    {
      title: 'Settings',
      icon: Settings,
      link: '/settings',
    },
    {
      title: 'Log out',
      icon: LogOut,
      link: '/auth',
    },
  ];

  public themeColors = [
    {
      name: 'base',
      code: '#e11d48',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];

  public themeMode = ['light', 'dark'];

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  public toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return {
        ...theme,
        mode: mode
      };
    });
  }

  public toggleThemeColor(color: string) {
    this.themeService.theme.update((theme) => {
      return {
        ...theme,
        color: color
      };
    });
  }
}
