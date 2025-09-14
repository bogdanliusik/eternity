import { Component, signal } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, InputTextModule, AngularSvgIconModule],
  templateUrl: './login.html'
})
export class Login {
  checked1 = signal<boolean>(true);
}
