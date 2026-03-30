import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  ViewChild,
  contentChild,
  TemplateRef,
  effect
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { MultiselectItem } from './multiselect.models';
import { MultiselectStore } from './multiselect.store';

@Component({
  selector: 'app-multiselect',
  imports: [NgTemplateOutlet, ClickOutsideDirective],
  providers: [
    MultiselectStore,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Multiselect),
      multi: true
    }
  ],
  templateUrl: './multiselect.html',
  styleUrl: './multiselect.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Multiselect<T extends MultiselectItem> implements ControlValueAccessor {
  readonly items = input<T[]>([]);
  readonly placeholder = input('');
  readonly searchPlaceholder = input('Search...');
  readonly disabled = input(false);
  readonly isControlDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.isControlDisabled());

  readonly selectedItemTpl = contentChild('selectedItem', { read: TemplateRef });
  readonly dropdownItemTpl = contentChild('dropdownItem', { read: TemplateRef });

  readonly isFocused = signal(false);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly store = inject(MultiselectStore);

  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Sync input items to store
    effect(() => {
      const items = this.items();
      this.store.setItems(items);
    });

    // Emit value changes (deferred to avoid ExpressionChangedAfterItHasBeenChecked)
    effect(() => {
      const selected = this.store.selectedItems();
      queueMicrotask(() => this.onChange(selected as T[]));
    });
  }

  // ControlValueAccessor
  writeValue(value: T[] | null | undefined): void {
    this.store.setSelectedItems(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
    if (isDisabled) {
      this.store.hideSelection();
      this.isFocused.set(false);
    }
  }

  // Template methods
  onContainerClick(): void {
    if (!this.isDisabled()) {
      this.store.openSelection();
      this.isFocused.set(true);
      setTimeout(() => this.searchInput?.nativeElement?.focus());
    }
  }

  onInputFocus(): void {
    if (!this.isDisabled()) {
      this.store.openSelection();
      this.isFocused.set(true);
      this.onTouched();
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearch(value);
  }

  selectItem(item: MultiselectItem): void {
    if (this.isDisabled()) {
      return;
    }

    this.store.selectItem(item);
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.focus();
    }
  }

  removeItem(event: Event, item: MultiselectItem): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }

    this.store.removeItem(item);
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }

    this.store.clearSelected();
    this.onContainerClick();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }

    this.store.toggleSelection();
    if (this.store.selectionOpened()) {
      this.isFocused.set(true);
      setTimeout(() => this.searchInput?.nativeElement?.focus());
    }
  }

  onClickOutside(): void {
    this.store.hideSelection();
    this.isFocused.set(false);
  }
}
