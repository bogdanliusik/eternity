import { Routes } from '@angular/router';

import { authenticationGuard } from './core/auth/auth.guard';
import { Layout } from './features/layout/layout';

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
      },
      {
        path: 'administration/sessions',
        loadComponent: () => import('./features/administration/sessions/sessions').then((m) => m.Sessions)
      },
      {
        path: 'call-history',
        loadComponent: () => import('./features/call-history/call-history').then((m) => m.CallHistory)
      },
      {
        path: 'call/:callId',
        loadComponent: () => import('./features/call-room/call-room').then((m) => m.CallRoom)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/registration/registration').then((m) => m.Registration)
  }
];
