import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { AdministrationService } from './administration.service';

/**
 * Global administration store for layout-level concerns.
 * Used primarily for showing pending registration count in the sidebar menu.
 */
interface AdministrationState {
  pendingRequestsCount: number;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AdministrationState = {
  pendingRequestsCount: 0,
  isLoading: false,
  isInitialized: false
};

export const AdministrationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasPendingRequests: computed(() => store.pendingRequestsCount() > 0),
    registrationRequestsCount: computed(() => store.pendingRequestsCount())
  })),
  withMethods((store, adminService = inject(AdministrationService)) => ({
    /**
     * Load initial pending count for menu badge.
     * Called once when admin user logs in.
     */
    loadInitialData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          adminService.getPendingRequestsCount().pipe(
            tapResponse({
              next: (count) => {
                patchState(store, {
                  pendingRequestsCount: count,
                  isLoading: false,
                  isInitialized: true
                });
              },
              error: () => {
                patchState(store, {
                  isLoading: false,
                  isInitialized: true
                });
              }
            })
          )
        )
      )
    ),

    /**
     * Update pending count (called when requests are approved/rejected)
     */
    updatePendingCount: (count: number) => {
      patchState(store, { pendingRequestsCount: count });
    }
  }))
);
