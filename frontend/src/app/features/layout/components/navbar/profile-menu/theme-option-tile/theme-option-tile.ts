import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-theme-option-tile',
  imports: [NgClass],
  templateUrl: './theme-option-tile.html'
})
export class ThemeOptionTile {
  label = input<string>('');
  active = input<boolean>(false);
  select = output<void>();
}
