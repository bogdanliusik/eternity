import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import { CallHistoryRecord, CallStatus, deriveUserDisplayStatus,NewCallRequest } from '../models/call-history.model';
import { CallHistoryService } from '../services/call-history.service';

type FilterTab = 'all' | CallStatus;

interface CallHistoryState {
  calls: CallHistoryRecord[];
  isLoading: boolean;
  activeFilter: FilterTab;
  newCallModalVisible: boolean;
  isCreatingCall: boolean;
}

const initialState: CallHistoryState = {
  calls: [],
  isLoading: false,
  activeFilter: 'all',
  newCallModalVisible: false,
  isCreatingCall: false
};

export const CallHistoryStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    filteredCalls: computed(() => {
      const filter = store.activeFilter();
      const calls = store.calls();
      if (filter === 'all') return calls;
      return calls.filter((c) => deriveUserDisplayStatus(c) === filter);
    }),
    activeCalls: computed(() => store.calls().filter((c) => deriveUserDisplayStatus(c) === CallStatus.Active)),
    totalCount: computed(() => store.calls().length),
    activeCount: computed(() => store.calls().filter((c) => deriveUserDisplayStatus(c) === CallStatus.Active).length),
    completedCount: computed(() => store.calls().filter((c) => deriveUserDisplayStatus(c) === CallStatus.Completed).length),
    missedCount: computed(() => store.calls().filter((c) => deriveUserDisplayStatus(c) === CallStatus.Missed).length),
    cancelledCount: computed(() => store.calls().filter((c) => deriveUserDisplayStatus(c) === CallStatus.Cancelled).length)
  })),
  withMethods((store, service = inject(CallHistoryService), router = inject(Router)) => {
    const loadCalls = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          service.getCallHistory().pipe(
            tapResponse({
              next: (calls) => patchState(store, { calls, isLoading: false }),
              error: () => patchState(store, { isLoading: false })
            })
          )
        )
      )
    );

    return {
      loadCalls,
      setFilter(filter: FilterTab) {
        patchState(store, { activeFilter: filter });
        loadCalls();
      },
      openNewCallModal() {
        patchState(store, { newCallModalVisible: true });
      },
      closeNewCallModal() {
        patchState(store, { newCallModalVisible: false });
      },
      createCall: rxMethod<NewCallRequest>(
        pipe(
          tap(() => patchState(store, { isCreatingCall: true })),
          switchMap((request) =>
            service.createCall(request).pipe(
              tapResponse({
                next: (newCall) => {
                  patchState(store, {
                    isCreatingCall: false,
                    newCallModalVisible: false
                  });
                  router.navigate(['/call', newCall.id]);
                },
                error: () => patchState(store, { isCreatingCall: false })
              })
            )
          )
        )
      )
    };
  })
);
