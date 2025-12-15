import { Component, input } from '@angular/core';
import { RegistrationRequestStatus } from '../../models/registration-request.model';

@Component({
  selector: 'app-request-tab-badge',
  template: `
    @if (isLoading()) {
      <span class="bg-muted flex h-5 w-5 animate-pulse items-center justify-center rounded-full">
        <span class="text-muted-foreground text-[10px]">...</span>
      </span>
    } @else if (count() > 0) {
      <span
        class="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
        [class.bg-primary]="status() === 'pending'"
        [class.bg-green-500]="status() === 'approved'"
        [class.bg-red-500]="status() === 'rejected'"
        [class.text-primary-contrast]="count() > 0">
        {{ count() }}
      </span>
    }
  `
})
export class RequestTabBadge {
  readonly status = input.required<RegistrationRequestStatus>();
  readonly count = input.required<number>();
  readonly isLoading = input<boolean>(false);
}
