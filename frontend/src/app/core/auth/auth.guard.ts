import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';

export function authenticationGuard(): boolean {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  if (authStore.isAuthenticated()) {
    return true;
  }
  void router.navigate(['/login']);
  return false;
};
