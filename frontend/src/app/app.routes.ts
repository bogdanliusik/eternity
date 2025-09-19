import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authenticationGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
  },
  {
    path: 'login',
    component: Login
  }
];
