import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, mergeMap } from 'rxjs';
import { RegistrationRequestsService } from '../services/registration-requests.service';
import { RegistrationRequest, RegistrationRequestStatus } from '../models/registration-request.model';
import { AdministrationStore } from '@/core/administration/administration.store';

interface RegistrationRequestsState {
  // Counts for all tabs (loaded once on init)
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  countsLoaded: boolean;
  countsLoading: boolean;

  // Requests data (loaded per tab)
  pendingRequests: RegistrationRequest[];
  approvedRequests: RegistrationRequest[];
  rejectedRequests: RegistrationRequest[];

  // UI state
  activeTab: RegistrationRequestStatus;
  isLoading: boolean;
  processingIds: string[];
}

const initialState: RegistrationRequestsState = {
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  countsLoaded: false,
  countsLoading: false,

  pendingRequests: [],
  approvedRequests: [],
  rejectedRequests: [],

  activeTab: 'pending',
  isLoading: false,
  processingIds: []
};

export const RegistrationRequestsStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    currentRequests: computed(() => {
      const tab = store.activeTab();
      if (tab === 'pending') {
        return store.pendingRequests();
      }
      if (tab === 'approved') {
        return store.approvedRequests();
      }
      return store.rejectedRequests();
    }),
    getCount: computed(() => (status: RegistrationRequestStatus) => {
      if (status === 'pending') {
        return store.pendingCount();
      }
      if (status === 'approved') {
        return store.approvedCount();
      }
      return store.rejectedCount();
    })
  })),
  withMethods(
    (store, service = inject(RegistrationRequestsService), globalAdminStore = inject(AdministrationStore)) => ({
      /**
       * Load all counts for tab badges.
       * Should be called once when the page opens.
       */
      loadAllCounts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { countsLoading: true })),
          switchMap(() =>
            service.getAllCounts().pipe(
              tapResponse({
                next: (counts) => {
                  patchState(store, {
                    pendingCount: counts.pending,
                    approvedCount: counts.approved,
                    rejectedCount: counts.rejected,
                    countsLoaded: true,
                    countsLoading: false
                  });
                },
                error: () => {
                  patchState(store, { countsLoading: false });
                }
              })
            )
          )
        )
      ),

      /**
       * Load requests for a specific tab.
       * Updates the active tab and fetches data.
       */
      loadRequests: rxMethod<RegistrationRequestStatus>(
        pipe(
          tap((status) => patchState(store, { isLoading: true, activeTab: status })),
          switchMap((status) =>
            service.getRequests(status).pipe(
              tapResponse({
                next: (requests) => {
                  const update: Partial<RegistrationRequestsState> = { isLoading: false };
                  if (status === 'pending') {
                    update.pendingRequests = requests;
                    update.pendingCount = requests.length;
                  } else if (status === 'approved') {
                    update.approvedRequests = requests;
                    update.approvedCount = requests.length;
                  } else if (status === 'rejected') {
                    update.rejectedRequests = requests;
                    update.rejectedCount = requests.length;
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

      /**
       * Approve a registration request.
       * Uses mergeMap to allow concurrent approvals.
       */
      approveRequest: rxMethod<string>(
        pipe(
          tap((id) =>
            patchState(store, {
              processingIds: [...store.processingIds(), id]
            })
          ),
          mergeMap((id) =>
            service.approveRequest(id).pipe(
              tapResponse({
                next: (updatedRequest) => {
                  // Remove from pending or rejected
                  const pendingRequests = store.pendingRequests().filter((r) => r.id !== id);
                  const rejectedRequests = store.rejectedRequests().filter((r) => r.id !== id);
                  // Add to approved
                  const approvedRequests = [updatedRequest, ...store.approvedRequests()];

                  // Calculate new counts
                  const wasPending = store.pendingRequests().some((r) => r.id === id);
                  const wasRejected = store.rejectedRequests().some((r) => r.id === id);
                  const newPendingCount = wasPending ? store.pendingCount() - 1 : store.pendingCount();

                  patchState(store, {
                    pendingRequests,
                    rejectedRequests,
                    approvedRequests,
                    pendingCount: newPendingCount,
                    rejectedCount: wasRejected ? store.rejectedCount() - 1 : store.rejectedCount(),
                    approvedCount: store.approvedCount() + 1,
                    processingIds: store.processingIds().filter((pid) => pid !== id)
                  });

                  // Sync with global admin store for menu badge
                  if (wasPending) {
                    globalAdminStore.updatePendingCount(newPendingCount);
                  }
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

      /**
       * Reject a registration request.
       * Uses mergeMap to allow concurrent rejections.
       */
      rejectRequest: rxMethod<string>(
        pipe(
          tap((id) =>
            patchState(store, {
              processingIds: [...store.processingIds(), id]
            })
          ),
          mergeMap((id) =>
            service.rejectRequest(id).pipe(
              tapResponse({
                next: (updatedRequest) => {
                  // Remove from pending
                  const pendingRequests = store.pendingRequests().filter((r) => r.id !== id);
                  // Add to rejected
                  const rejectedRequests = [updatedRequest, ...store.rejectedRequests()];
                  const newPendingCount = store.pendingCount() - 1;

                  patchState(store, {
                    pendingRequests,
                    rejectedRequests,
                    pendingCount: newPendingCount,
                    rejectedCount: store.rejectedCount() + 1,
                    processingIds: store.processingIds().filter((pid) => pid !== id)
                  });

                  // Sync with global admin store for menu badge
                  globalAdminStore.updatePendingCount(newPendingCount);
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

      setActiveTab: (tab: RegistrationRequestStatus) => {
        patchState(store, { activeTab: tab });
      }
    })
  )
);
