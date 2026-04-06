import { InjectionToken } from '@angular/core';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, switchMap, tap } from 'rxjs';

import { TabbedListConfig } from './tabbed-list.models';

export const TABBED_LIST_CONFIG = new InjectionToken<TabbedListConfig>('TabbedListConfig');

interface TabData {
  items: unknown[];
  totalCount: number | null;
  page: number;
}

interface TabbedListState {
  tabData: Record<string, TabData>;
  activeTab: string;
  pageSize: number;
  isLoading: boolean;
  processingIds: string[];
}

const EMPTY_TAB: TabData = { items: [], totalCount: null, page: 1 };

export const TabbedListStore = signalStore(
  withState<TabbedListState>({
    tabData: {},
    activeTab: '',
    pageSize: 30,
    isLoading: false,
    processingIds: []
  }),
  withComputed((store) => ({
    currentItems: computed(() => {
      return store.tabData()[store.activeTab()]?.items ?? [];
    }),
    currentPage: computed(() => {
      return store.tabData()[store.activeTab()]?.page ?? 1;
    }),
    currentTotalCount: computed(() => {
      const data = store.tabData()[store.activeTab()];
      if (!data) return 0;
      return data.totalCount ?? data.items.length;
    }),
    tabCount: computed(() => (tabId: string): number | null => {
      return store.tabData()[tabId]?.totalCount ?? null;
    }),
    tabItems: computed(() => (tabId: string): unknown[] => {
      return store.tabData()[tabId]?.items ?? [];
    })
  })),
  withMethods((store, config = inject(TABBED_LIST_CONFIG)) => {
    const initialTabData: Record<string, TabData> = {};
    for (const tab of config.tabs) {
      initialTabData[tab.id] = { ...EMPTY_TAB };
    }
    patchState(store, {
      tabData: initialTabData,
      activeTab: config.defaultTab,
      pageSize: config.pageSize
    });
    function getTabData(tabId: string): TabData {
      return store.tabData()[tabId] ?? { ...EMPTY_TAB };
    }
    const load = rxMethod<{ tab?: string; page?: number }>(
      pipe(
        map((payload) => ({
          tab: payload.tab ?? store.activeTab(),
          page: payload.page ?? getTabData(payload.tab ?? store.activeTab()).page
        })),
        tap(({ tab, page }) => {
          const current = getTabData(tab);
          patchState(store, {
            isLoading: true,
            activeTab: tab,
            tabData: {
              ...store.tabData(),
              [tab]: { ...current, page }
            }
          });
        }),
        switchMap(({ tab, page }) =>
          config.loadFn(tab, page, store.pageSize()).pipe(
            tapResponse({
              next: (result) => {
                const current = getTabData(tab);
                patchState(store, {
                  isLoading: false,
                  tabData: {
                    ...store.tabData(),
                    [tab]: { ...current, items: result.items, totalCount: result.totalCount, page }
                  }
                });
              },
              error: () => {
                patchState(store, { isLoading: false });
              }
            })
          )
        )
      )
    );
    return {
      load,
      refresh: () => {
        const tab = store.activeTab();
        load({ tab, page: getTabData(tab).page });
      },
      removeItem: (
        itemId: string,
        options?: {
          fromTabs?: string[];
          countAdjustments?: Record<string, number>;
        }
      ) => {
        const fromTabs = options?.fromTabs ?? config.tabs.map((t) => t.id);
        const newTabData = { ...store.tabData() };

        for (const tabId of fromTabs) {
          const data = newTabData[tabId];
          if (!data) continue;
          const filtered = data.items.filter((item) => config.itemId(item) !== itemId);
          const wasFound = filtered.length < data.items.length;
          if (wasFound) {
            newTabData[tabId] = {
              ...data,
              items: filtered,
              totalCount: data.totalCount !== null ? Math.max(0, data.totalCount - 1) : null
            };
          }
        }
        if (options?.countAdjustments) {
          for (const [tabId, delta] of Object.entries(options.countAdjustments)) {
            const data = newTabData[tabId];
            if (data && data.totalCount !== null) {
              newTabData[tabId] = {
                ...data,
                totalCount: Math.max(0, data.totalCount + delta)
              };
            }
          }
        }
        patchState(store, { tabData: newTabData });
        const activeTab = store.activeTab();
        const activeData = newTabData[activeTab];
        if (activeData && activeData.items.length === 0 && activeData.page > 1) {
          load({ tab: activeTab, page: activeData.page - 1 });
        }
      },
      addProcessingId: (id: string) => {
        patchState(store, { processingIds: [...store.processingIds(), id] });
      },
      removeProcessingId: (id: string) => {
        patchState(store, {
          processingIds: store.processingIds().filter((pid) => pid !== id)
        });
      },
      adjustTabCount: (tabId: string, delta: number) => {
        const data = getTabData(tabId);
        if (data.totalCount !== null) {
          patchState(store, {
            tabData: {
              ...store.tabData(),
              [tabId]: { ...data, totalCount: Math.max(0, data.totalCount + delta) }
            }
          });
        }
      }
    };
  })
);
