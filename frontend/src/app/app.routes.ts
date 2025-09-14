import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';
import { Login } from './features/auth/pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: Layout
  },
  {
    path: 'login',
    component: Login
  }
];
