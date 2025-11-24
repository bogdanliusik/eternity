import { ThemeService } from '@/core/themes/theme.service';
import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CircleUserRound, Settings, LogOut, Sun, Moon, LucideAngularModule } from 'lucide-angular';
import { ThemeConfigurator } from "./theme-configurator/theme-configurator";

@Component({
  selector: 'app-profile-menu',
  imports: [ClickOutsideDirective, RouterLink, LucideAngularModule, ThemeConfigurator],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible'
        })
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden'
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')])
    ])
  ]
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
      link: '/profile'
    },
    {
      title: 'Settings',
      icon: Settings,
      link: '/settings'
    },
    {
      title: 'Log out',
      icon: LogOut,
      link: '/auth'
    }
  ];

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }
}
