import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { map, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { SessionsService } from '../services/sessions.service';
import { Session, SessionStatus } from '../models/session.model';

interface SessionsState {
  activeSessions: Session[];
  inactiveSessions: Session[];
  activeTotalCount: number | null;
  inactiveTotalCount: number | null;
  activePage: number;
  inactivePage: number;
  pageSize: number;
  activeTab: SessionStatus;
  isLoading: boolean;
  processingIds: string[];
}

const initialState: SessionsState = {
  activeSessions: [],
  inactiveSessions: [],
  activeTotalCount: null,
  inactiveTotalCount: null,
  activePage: 1,
  inactivePage: 1,
  pageSize: 30,
  activeTab: SessionStatus.Active,
  isLoading: false,
  processingIds: []
};

export const SessionsStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    currentSessions: computed(() =>
      store.activeTab() === SessionStatus.Active ? store.activeSessions() : store.inactiveSessions()
    ),
    currentPage: computed(() =>
      store.activeTab() === SessionStatus.Active ? store.activePage() : store.inactivePage()
    ),
    currentTotalCount: computed(() =>
      store.activeTab() === SessionStatus.Active
        ? (store.activeTotalCount() ?? store.activeSessions().length)
        : (store.inactiveTotalCount() ?? store.inactiveSessions().length)
    ),
    getCount: computed(() => (status: SessionStatus) => {
      if (status === SessionStatus.Active) {
        return store.activeTotalCount();
      }
      return store.inactiveTotalCount();
    })
  })),
  withMethods((store, service = inject(SessionsService)) => {
    const loadSessions = rxMethod<{ tab?: SessionStatus; page?: number }>(
      pipe(
        map((payload) => {
          const tab = payload?.tab ?? store.activeTab();
          const page = payload?.page ?? (tab === SessionStatus.Active ? store.activePage() : store.inactivePage());
          return { tab, page };
        }),
        tap(({ tab, page }) => {
          patchState(store, {
            isLoading: true,
            activeTab: tab,
            ...(tab === SessionStatus.Active ? { activePage: page } : { inactivePage: page })
          });
        }),
        switchMap(({ tab, page }) =>
          service.getSessions(tab === SessionStatus.Active, page, store.pageSize()).pipe(
            tapResponse({
              next: (response) => {
                const update: Partial<SessionsState> = { isLoading: false };
                if (tab === SessionStatus.Active) {
                  update.activeSessions = response.items;
                  update.activeTotalCount = response.totalCount;
                  update.activePage = page;
                } else {
                  update.inactiveSessions = response.items;
                  update.inactiveTotalCount = response.totalCount;
                  update.inactivePage = page;
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
    );
    const terminateSession = rxMethod<Session>(
      pipe(
        tap((session) =>
          patchState(store, {
            processingIds: [...store.processingIds(), session.id]
          })
        ),
        mergeMap((session) =>
          service.terminateSession(session.id).pipe(
            tapResponse({
              next: () => {
                const activeSessions = store.activeSessions().filter((s) => s.id !== session.id);
                const currentActiveTotal = store.activeTotalCount();
                const currentInactiveTotal = store.inactiveTotalCount();
                const activeTotal =
                  currentActiveTotal === null ? activeSessions.length : Math.max(0, currentActiveTotal - 1);
                const inactiveTotal = currentInactiveTotal === null ? null : currentInactiveTotal + 1;
                patchState(store, {
                  activeSessions,
                  activeTotalCount: activeTotal,
                  inactiveTotalCount: inactiveTotal,
                  processingIds: store.processingIds().filter((id) => id !== session.id)
                });
                if (
                  store.activeTab() === SessionStatus.Active &&
                  activeSessions.length === 0 &&
                  store.activePage() > 1
                ) {
                  const newPage = store.activePage() - 1;
                  patchState(store, { activePage: newPage });
                  loadSessions({ tab: SessionStatus.Active, page: newPage });
                }
              },
              error: () => {
                patchState(store, {
                  processingIds: store.processingIds().filter((id) => id !== session.id)
                });
              }
            })
          )
        )
      )
    );

    return {
      loadSessions,
      terminateSession,
      setActiveTab: (tab: SessionStatus) => {
        patchState(store, { activeTab: tab });
      }
    };
  })
);
