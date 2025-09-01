import { ColorScale } from '@primeuix/themes';
import { ThemeColorName, ThemeMode, ThemeSurfaceName } from './theme.types';

export interface Theme {
  mode: ThemeMode;
  color: ThemeColorName;
  surface: ThemeSurfaceName;
}

export interface ThemeSurface {
  name: ThemeSurfaceName;
  palette: Required<ColorScale>;
}

export interface ThemeColor {
  name: ThemeColorName;
  palette: Required<ColorScale>;
}
