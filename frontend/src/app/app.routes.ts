import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authenticationGuard } from './core/auth/auth.guard';
import { Profile } from './features/profile/profile';
import { RegistrationRequests } from './features/administration/registration-requests/registration-requests';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'administration/registration-requests',
        component: RegistrationRequests
      }
    ]
  },
  {
    path: 'login',
    component: Login
  }
];
