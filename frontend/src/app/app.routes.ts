import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';
import { authenticationGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile)
      },
      {
        path: 'administration/registration-requests',
        loadComponent: () =>
          import('./features/administration/registration-requests/registration-requests').then(
            (m) => m.RegistrationRequests
          )
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login)
  }
];
