import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { CallHistoryService } from '../services/call-history.service';
import { CallRecord, CallStatus, NewCallRequest } from '../models/call-history.model';

type FilterTab = 'all' | CallStatus;

interface CallHistoryState {
  calls: CallRecord[];
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
      return calls.filter((c) => c.status === filter);
    }),
    activeCalls: computed(() => store.calls().filter((c) => c.status === CallStatus.Active)),
    totalCount: computed(() => store.calls().length),
    activeCount: computed(() => store.calls().filter((c) => c.status === CallStatus.Active).length),
    completedCount: computed(() => store.calls().filter((c) => c.status === CallStatus.Completed).length),
    missedCount: computed(() => store.calls().filter((c) => c.status === CallStatus.Missed).length)
  })),
  withMethods((store, service = inject(CallHistoryService)) => ({
    loadCalls: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          service.getCalls().pipe(
            tapResponse({
              next: (calls) => patchState(store, { calls, isLoading: false }),
              error: () => patchState(store, { isLoading: false })
            })
          )
        )
      )
    ),
    setFilter(filter: FilterTab) {
      patchState(store, { activeFilter: filter });
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
              next: (newCall) =>
                patchState(store, {
                  calls: [newCall, ...store.calls()],
                  isCreatingCall: false,
                  newCallModalVisible: false
                }),
              error: () => patchState(store, { isCreatingCall: false })
            })
          )
        )
      )
    )
  }))
);
