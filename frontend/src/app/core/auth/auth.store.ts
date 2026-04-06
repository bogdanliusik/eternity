import { computed, DOCUMENT, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, firstValueFrom, from, pipe, switchMap, tap } from 'rxjs';

import { ApiError } from '../models/api.error';
import { GeneralHubService } from '../services/general-hub.service';
import { AuthService, RegisterRequest } from './auth.service';
import { CurrentUser } from './models/current.user';
import { LoginRequest } from './models/login.request';

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
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  status: AuthStatus.Unknown,
  errors: [],
  isLoading: false,
  registrationSuccess: false
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      generalHubService = inject(GeneralHubService)
    ) => ({
      initializeAuth: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: AuthStatus.Checking, isLoading: true })),
          switchMap(() => {
            return authService.getCurrentUser().pipe(
              switchMap((user) =>
                from(generalHubService.connect()).pipe(
                  tapResponse({
                    next: () => {
                      patchState(store, {
                        user,
                        status: AuthStatus.Authenticated,
                        errors: [],
                        isLoading: false
                      });
                    },
                    error: () => {
                      // Connection failed but user is still authenticated
                      patchState(store, {
                        user,
                        status: AuthStatus.Authenticated,
                        errors: [],
                        isLoading: false
                      });
                    }
                  })
                )
              ),
              catchError((error: ApiError) => {
                const isUnauthorized = error.status === 401;
                patchState(store, {
                  user: null,
                  status: AuthStatus.Unauthenticated,
                  errors: isUnauthorized ? [] : ['Failed to check authentication'],
                  isLoading: false
                });
                return EMPTY;
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
                    switchMap((user) =>
                      from(generalHubService.connect()).pipe(
                        tapResponse({
                          next: () => {
                            patchState(store, {
                              user,
                              status: AuthStatus.Authenticated,
                              errors: [],
                              isLoading: false
                            });
                            router.navigate(['/']);
                          },
                          error: () => {
                            patchState(store, {
                              user,
                              status: AuthStatus.Authenticated,
                              errors: [],
                              isLoading: false
                            });
                            router.navigate(['/']);
                          }
                        })
                      )
                    ),
                    catchError((error: ApiError) => {
                      patchState(store, {
                        user: null,
                        status: AuthStatus.Unauthenticated,
                        errors: [error.message],
                        isLoading: false
                      });
                      return EMPTY;
                    })
                  );
                }
                const errors = result.errors.length ? result.errors : ['Login failed'];
                patchState(store, {
                  errors,
                  isLoading: false
                });
                return EMPTY;
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
      refreshUser: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, errors: [] })),
          switchMap(() =>
            authService.getCurrentUser().pipe(
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
                  if (error.status === 401) {
                    patchState(store, {
                      user: null,
                      status: AuthStatus.Unauthenticated,
                      errors: ['Session expired'],
                      isLoading: false
                    });
                    router.navigate(['/login']);
                  } else {
                    patchState(store, {
                      errors: [error.message],
                      isLoading: false
                    });
                  }
                }
              })
            )
          )
        )
      ),
      register: rxMethod<RegisterRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, errors: [], registrationSuccess: false })),
          switchMap((request) =>
            authService.register(request).pipe(
              tapResponse({
                next: (result) => {
                  if (result.succeeded) {
                    patchState(store, {
                      registrationSuccess: true,
                      errors: [],
                      isLoading: false
                    });
                  } else {
                    const errors = result.errors.length ? result.errors : ['Registration failed'];
                    patchState(store, {
                      errors,
                      isLoading: false
                    });
                  }
                },
                error: (error: ApiError) => {
                  patchState(store, {
                    errors: error.errors.length > 0 ? error.errors : [error.message],
                    isLoading: false
                  });
                }
              })
            )
          )
        )
      ),
      handleUnauthorized: () => {
        if (store.status() === AuthStatus.Authenticated) {
          generalHubService.disconnect();
          patchState(store, {
            user: null,
            status: AuthStatus.Unauthenticated,
            errors: ['Session expired'],
            isLoading: false
          });
          router.navigate(['/login']);
        }
      },
      clearErrors: () => {
        patchState(store, { errors: [], registrationSuccess: false });
      },
      setUnauthenticated: () => {
        patchState(store, { status: AuthStatus.Unauthenticated });
      }
    })
  ),
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
