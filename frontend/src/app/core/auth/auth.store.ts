import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CurrentUser } from './models/current.user';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, DOCUMENT, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { catchError, EMPTY, filter, firstValueFrom, pipe, switchMap, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { LoginRequest } from './models/login.request';
import { ApiError } from '../models/api.error';

export enum AuthStatus {
  Unknown = 'unknown',
  Checking = 'checking',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated'
}

interface AuthState {
  user: CurrentUser | null;
  status: AuthStatus;
  errors: string[];
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  status: AuthStatus.Unknown,
  errors: [],
  isLoading: false
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    initializeAuth: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: AuthStatus.Checking, isLoading: true })),
        switchMap(() => {
          return authService.getCurrentUser().pipe(
            tapResponse({
              next: (user) => {
                patchState(store, {
                  user,
                  status: AuthStatus.Authenticated,
                  errors: [],
                  isLoading: false
                });
              },
              error: (error: ApiError) => {
                const isUnauthorized = error.status === 401;
                patchState(store, {
                  user: null,
                  status: AuthStatus.Unauthenticated,
                  errors: isUnauthorized ? [] : ['Failed to check authentication'],
                  isLoading: false
                });
              }
            })
          );
        })
      )
    ),
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, errors: [] })),
        switchMap((credentials) =>
          authService.loginWithCookies(credentials).pipe(
            switchMap((result) => {
              if (result.succeeded) {
                return authService.getCurrentUser().pipe(
                  tapResponse({
                    next: (user) => {
                      patchState(store, {
                        user,
                        status: AuthStatus.Authenticated,
                        errors: [],
                        isLoading: false
                      });
                      router.navigate(['/']);
                    },
                    error: (error: ApiError) => {
                      patchState(store, {
                        user: null,
                        status: AuthStatus.Unauthenticated,
                        errors: [error.message],
                        isLoading: false
                      });
                    }
                  })
                );
              } else {
                const errors = result.errors.length ? result.errors : ['Login failed'];
                patchState(store, {
                  errors,
                  isLoading: false
                });
                return EMPTY;
              }
            }),
            catchError((error: ApiError) => {
              patchState(store, {
                errors: [error.message],
                isLoading: false
              });
              return EMPTY;
            })
          )
        )
      )
    ),
    handleUnauthorized: () => {
      if (store.status() === AuthStatus.Authenticated) {
        patchState(store, {
          user: null,
          status: AuthStatus.Unauthenticated,
          errors: ['Session expired']
        });
        router.navigate(['/login']);
      }
    },
    clearErrors: () => {
      patchState(store, { errors: [] });
    },
    setUnauthenticated: () => {
      patchState(store, { status: AuthStatus.Unauthenticated });
    }
  })),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.status() === AuthStatus.Authenticated),
    isUnauthenticated: computed(() => store.status() === AuthStatus.Unauthenticated),
    isCheckingAuth: computed(() => store.status() === AuthStatus.Checking),
    hasUser: computed(() => !!store.user()),
    hasErrors: computed(() => store.errors().length > 0)
  }))
);

const PUBLIC_ROUTES = ['/login', '/register'];

export function initializeAuth() {
  return () => {
    const authStore = inject(AuthStore);
    const document = inject(DOCUMENT);
    const currentPath = document.defaultView?.location.pathname || '/';
    if (PUBLIC_ROUTES.some((route) => currentPath.startsWith(route))) {
      authStore.setUnauthenticated();
      return Promise.resolve();
    }
    authStore.initializeAuth();
    return firstValueFrom(
      toObservable(authStore.status).pipe(
        filter((status) => status !== AuthStatus.Unknown && status !== AuthStatus.Checking)
      )
    );
  };
}
