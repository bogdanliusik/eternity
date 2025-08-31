import { Component, computed, inject, signal, Signal } from '@angular/core';
import { ThemeOptionTile } from '../theme-option-tile/theme-option-tile';
import Aura from '@primeuix/themes/aura';
import { ThemeColor, ThemeSurface } from '@/core/themes/theme.models';
import { ThemeService } from '@/core/themes/theme.service';
import { ColorScale, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import { THEME_COLORS, THEME_SURFACES } from '@/core/themes/theme.constants';
import { ThemeColorName, ThemeMode } from '@/core/themes/theme.types';
import { SunIcon, MoonIcon, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-theme-configurator',
  imports: [ThemeOptionTile, LucideAngularModule],
  templateUrl: './theme-configurator.html'
})
export class ThemeConfigurator {
  private readonly themeService = inject(ThemeService);
  readonly sunIcon = SunIcon;
  readonly moonIcon = MoonIcon;

  readonly theme = this.themeService.theme;
  readonly themeMode: Array<ThemeMode> = ['light', 'dark'];
  readonly primaryColors: Signal<ThemeColor[]> = computed(() => {
    const preset = Aura.primitive as Record<ThemeColorName, Required<ColorScale>>;
    return THEME_COLORS.map((name) => ({
      name,
      palette: preset[name]
    }));
  });
  readonly surfaces = signal<ThemeSurface[]>(THEME_SURFACES);

  toggleMode(mode: ThemeMode) {
    this.theme.update((t) => ({
      ...t,
      mode
    }));
  }

  togglePrimaryColor(color: ThemeColorName): void {
    this.theme.update((theme) => ({
      ...theme,
      color
    }));
    updatePreset(this.buildThemePreset());
  }

  toggleSurface(surface: ThemeSurface): void {
    this.theme.update((theme) => ({
      ...theme,
      surface: surface.name
    }));
    updateSurfacePalette(surface.palette);
  }

  buildThemePreset() {
    const color = this.primaryColors().find((c) => c.name === this.themeService.theme().color);
    return {
      semantic: {
        primary: color?.palette,
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: '#ffffff',
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}'
            },
            highlight: {
              background: '{primary.50}',
              focusBackground: '{primary.100}',
              color: '{primary.700}',
              focusColor: '{primary.800}'
            }
          },
          dark: {
            primary: {
              color: '{primary.400}',
              contrastColor: '{surface.900}',
              hoverColor: '{primary.300}',
              activeColor: '{primary.200}'
            },
            highlight: {
              background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
              focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
              color: 'rgba(255,255,255,.87)',
              focusColor: 'rgba(255,255,255,.87)'
            }
          }
        }
      }
    };
  }
}
