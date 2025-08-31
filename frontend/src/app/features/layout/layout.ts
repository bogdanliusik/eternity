import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Navbar, ButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {}
