import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { AdministrationService } from './administration.service';
import { RegistrationRequest, RegistrationRequestStatus } from './models/registration-request';

interface AdministrationState {
  pendingRequestsCount: number;
  pendingRequests: RegistrationRequest[];
  approvedRequests: RegistrationRequest[];
  rejectedRequests: RegistrationRequest[];
  activeTab: RegistrationRequestStatus;
  isLoading: boolean;
  isInitialized: boolean;
  processingIds: string[];
}

const initialState: AdministrationState = {
  pendingRequestsCount: 0,
  pendingRequests: [],
  approvedRequests: [],
  rejectedRequests: [],
  activeTab: 'pending',
  isLoading: false,
  isInitialized: false,
  processingIds: []
};

export const AdministrationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, adminService = inject(AdministrationService)) => ({
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
    loadRequests: rxMethod<RegistrationRequestStatus>(
      pipe(
        tap((status) => patchState(store, { isLoading: true, activeTab: status })),
        switchMap((status) =>
          adminService.getRegistrationRequests(status).pipe(
            tapResponse({
              next: (requests) => {
                const update: Partial<AdministrationState> = { isLoading: false };
                if (status === 'pending') {
                  update.pendingRequests = requests;
                  update.pendingRequestsCount = requests.length;
                } else if (status === 'approved') {
                  update.approvedRequests = requests;
                } else if (status === 'rejected') {
                  update.rejectedRequests = requests;
                }
                patchState(store, update);
              },
              error: () => {
                patchState(store, { isLoading: false });
              }
            })
          )
        )
      )
    ),
    setActiveTab: (tab: RegistrationRequestStatus) => {
      patchState(store, { activeTab: tab });
    },
    approveRequest: rxMethod<string>(
      pipe(
        tap((id) =>
          patchState(store, {
            processingIds: [...store.processingIds(), id]
          })
        ),
        switchMap((id) =>
          adminService.approveRegistrationRequest(id).pipe(
            tapResponse({
              next: (updatedRequest) => {
                // Remove from pending or rejected
                const pendingRequests = store.pendingRequests().filter((r) => r.id !== id);
                const rejectedRequests = store.rejectedRequests().filter((r) => r.id !== id);
                // Add to approved
                const approvedRequests = [updatedRequest, ...store.approvedRequests()];

                patchState(store, {
                  pendingRequests,
                  rejectedRequests,
                  approvedRequests,
                  pendingRequestsCount: pendingRequests.length,
                  processingIds: store.processingIds().filter((pid) => pid !== id)
                });
              },
              error: () => {
                patchState(store, {
                  processingIds: store.processingIds().filter((pid) => pid !== id)
                });
              }
            })
          )
        )
      )
    ),
    rejectRequest: rxMethod<string>(
      pipe(
        tap((id) =>
          patchState(store, {
            processingIds: [...store.processingIds(), id]
          })
        ),
        switchMap((id) =>
          adminService.rejectRegistrationRequest(id).pipe(
            tapResponse({
              next: (updatedRequest) => {
                // Remove from pending
                const pendingRequests = store.pendingRequests().filter((r) => r.id !== id);
                // Add to rejected
                const rejectedRequests = [updatedRequest, ...store.rejectedRequests()];

                patchState(store, {
                  pendingRequests,
                  rejectedRequests,
                  pendingRequestsCount: pendingRequests.length,
                  processingIds: store.processingIds().filter((pid) => pid !== id)
                });
              },
              error: () => {
                patchState(store, {
                  processingIds: store.processingIds().filter((pid) => pid !== id)
                });
              }
            })
          )
        )
      )
    ),
    refreshPendingCount: rxMethod<void>(
      pipe(
        switchMap(() =>
          adminService.getPendingRequestsCount().pipe(
            tapResponse({
              next: (count) => {
                patchState(store, { pendingRequestsCount: count });
              },
              error: () => {
                // Silent fail on refresh
              }
            })
          )
        )
      )
    )
  })),
  withComputed((store) => ({
    hasPendingRequests: computed(() => store.pendingRequestsCount() > 0),
    currentRequests: computed(() => {
      const tab = store.activeTab();
      if (tab === 'pending') return store.pendingRequests();
      if (tab === 'approved') return store.approvedRequests();
      return store.rejectedRequests();
    }),
    registrationRequestsCount: computed(() => store.pendingRequestsCount())
  }))
);
