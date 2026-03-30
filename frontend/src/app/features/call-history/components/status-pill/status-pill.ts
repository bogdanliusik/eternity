import { Component, computed, input } from '@angular/core';
import { CallStatus } from '../../models/call-history.model';

@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.html'
})
export class StatusPill {
  readonly status = input.required<CallStatus>();

  readonly label = computed(() => {
    switch (this.status()) {
      case CallStatus.Active:
        return 'Live';
      case CallStatus.Completed:
        return 'Completed';
      case CallStatus.Missed:
        return 'Missed';
      case CallStatus.Declined:
        return 'Declined';
    }
  });

  readonly toneClass = computed(() => {
    switch (this.status()) {
      case CallStatus.Active:
        return 'bg-emerald-600/15 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300';
      case CallStatus.Completed:
        return 'bg-sky-600/15 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300';
      case CallStatus.Missed:
        return 'bg-amber-600/15 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300';
      case CallStatus.Declined:
        return 'bg-rose-600/15 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300';
    }
  });

  readonly dotClass = computed(() => {
    switch (this.status()) {
      case CallStatus.Active:
        return 'bg-emerald-600 dark:bg-emerald-300';
      case CallStatus.Completed:
        return 'bg-sky-600 dark:bg-sky-300';
      case CallStatus.Missed:
        return 'bg-amber-600 dark:bg-amber-300';
      case CallStatus.Declined:
        return 'bg-rose-600 dark:bg-rose-300';
    }
  });
}
