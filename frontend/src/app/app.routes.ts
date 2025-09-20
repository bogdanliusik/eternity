import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authenticationGuard } from './core/auth/auth.guard';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'profile',
        component: Profile
      }
    ]
  },
  {
    path: 'login',
    component: Login
  }
];
