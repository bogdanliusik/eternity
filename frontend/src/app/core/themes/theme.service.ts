import { Injectable, signal } from '@angular/core';
import { effect } from '@angular/core';
import { Theme } from './theme.models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme = signal<Theme>({
    mode: 'dark',
    color: 'rose',
    surface: 'gray'
  });

  constructor() {
    this.loadTheme();
    effect(() => {
      this.setConfig();
    });
  }

  private loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      this.theme.set(JSON.parse(theme));
    }
  }

  private setConfig() {
    this.setLocalStorage();
    this.setThemeClass();
  }

  private setThemeClass() {
    document.querySelector('html')!.className = this.theme().mode;
  }

  private setLocalStorage() {
    localStorage.setItem('theme', JSON.stringify(this.theme()));
  }
}
