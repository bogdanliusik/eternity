import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, ArrowUpRight, ArrowDownLeft } from 'lucide-angular';
import { CallDirection, CallStatus } from '../../models/call-history.model';

@Component({
  selector: 'app-status-pill',
  imports: [LucideAngularModule],
  templateUrl: './status-pill.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusPill {
  readonly status = input.required<CallStatus>();
  readonly direction = input<CallDirection>();

  readonly arrowUpRightIcon = ArrowUpRight;
  readonly arrowDownLeftIcon = ArrowDownLeft;

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
      case CallStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
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
      case CallStatus.Cancelled:
        return 'bg-slate-600/15 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300';
      default:
        return '';
    }
  });

  readonly directionIcon = computed(() => {
    const dir = this.direction();
    if (!dir) return null;
    return dir === CallDirection.Outgoing ? this.arrowUpRightIcon : this.arrowDownLeftIcon;
  });

  readonly directionIconClass = computed(() => {
    if (!this.direction()) return '';
    switch (this.status()) {
      case CallStatus.Active:
        return 'text-emerald-600 dark:text-emerald-300';
      case CallStatus.Completed:
        return 'text-sky-600 dark:text-sky-300';
      case CallStatus.Missed:
        return this.direction() === CallDirection.Outgoing
          ? 'text-amber-600 dark:text-amber-300'
          : 'text-rose-600 dark:text-rose-300';
      case CallStatus.Declined:
        return 'text-rose-600 dark:text-rose-300';
      case CallStatus.Cancelled:
        return 'text-slate-600 dark:text-slate-300';
      default:
        return '';
    }
  });
}
