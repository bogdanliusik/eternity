import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Dialog, InputTextModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'eternity';

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  public toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('eternity-dark');
  }
}
