import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Filter,LucideAngularModule, PhoneCall, RefreshCw } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { IncomingCallService } from '@/core/services/incoming-call.service';

import { CallCard } from './components/call-card/call-card';
import { CallHistoryEmpty } from './components/call-history-empty/call-history-empty';
import { CallHistorySkeleton } from './components/call-history-skeleton/call-history-skeleton';
import { NewCallModal } from './components/new-call-modal/new-call-modal';
import { CallHistoryRecord, CallStatus } from './models/call-history.model';
import { CallHistoryStore } from './store/call-history.store';

interface FilterOption {
  id: 'all' | CallStatus;
  label: string;
}

@Component({
  selector: 'app-call-history',
  imports: [NgClass, ButtonModule, LucideAngularModule, CallCard, CallHistorySkeleton, CallHistoryEmpty, NewCallModal],
  providers: [CallHistoryStore],
  templateUrl: './call-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class CallHistory implements OnInit {
  readonly store = inject(CallHistoryStore);
  private readonly incomingCallService = inject(IncomingCallService);

  readonly phoneCallIcon = PhoneCall;
  readonly refreshIcon = RefreshCw;
  readonly filterIcon = Filter;

  readonly filters: FilterOption[] = [
    { id: 'all', label: 'All calls' },
    { id: CallStatus.Active, label: 'Live' },
    { id: CallStatus.Completed, label: 'Completed' },
    { id: CallStatus.Missed, label: 'Missed' },
    { id: CallStatus.Declined, label: 'Declined' },
    { id: CallStatus.Cancelled, label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.store.loadCalls();
  }

  onFilterChange(filterId: 'all' | CallStatus): void {
    this.store.setFilter(filterId);
  }

  onRefresh(): void {
    this.store.loadCalls();
  }

  onNewCall(): void {
    this.store.openNewCallModal();
  }

  onJoinCall(call: CallHistoryRecord): void {
    this.incomingCallService.openPreJoinForExistingCall(call.id, call.type, call.name ?? 'Call');
  }
}
