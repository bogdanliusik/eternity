import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { MultiselectItem } from './multiselect.models';

interface MultiselectState {
  items: MultiselectItem[];
  selectedItems: MultiselectItem[];
  selectionOpened: boolean;
  search: string;
}

const initialState: MultiselectState = {
  items: [],
  selectedItems: [],
  selectionOpened: false,
  search: ''
};

export const MultiselectStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const selectedIds = computed(() => new Set(store.selectedItems().map((i) => i.id)));
    return {
      selectedIds,
      availableItems: computed(() => {
        const ids = selectedIds();
        const search = store.search().toLowerCase();
        let items = store.items().filter((item) => !ids.has(item.id));
        if (search) {
          items = items.filter((item) => {
            return Object.values(item).some(
              (val) => typeof val === 'string' && val.toLowerCase().includes(search)
            );
          });
        }
        return items;
      }),
      selectedCount: computed(() => store.selectedItems().length),
      availableCount: computed(() => {
        const ids = selectedIds();
        return store.items().filter((item) => !ids.has(item.id)).length;
      })
    };
  }),
  withMethods((store) => ({
    setItems(items: MultiselectItem[]) {
      patchState(store, { items });
    },
    setSelectedItems(items: MultiselectItem[]) {
      patchState(store, { selectedItems: items });
    },
    selectItem(item: MultiselectItem) {
      patchState(store, {
        selectedItems: [...store.selectedItems(), item],
        search: ''
      });
    },
    removeItem(item: MultiselectItem) {
      patchState(store, {
        selectedItems: store.selectedItems().filter((i) => i.id !== item.id)
      });
    },
    clearSelected() {
      patchState(store, { selectedItems: [], search: '' });
    },
    setSearch(search: string) {
      patchState(store, { search });
    },
    openSelection() {
      patchState(store, { selectionOpened: true });
    },
    hideSelection() {
      patchState(store, { selectionOpened: false });
    },
    toggleSelection() {
      patchState(store, { selectionOpened: !store.selectionOpened() });
    }
  }))
);
