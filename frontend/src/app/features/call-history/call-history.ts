import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, PhoneCall, RefreshCw, Filter } from 'lucide-angular';
import { CallHistoryStore } from './store/call-history.store';
import { CallCard } from './components/call-card/call-card';
import { CallHistorySkeleton } from './components/call-history-skeleton/call-history-skeleton';
import { CallHistoryEmpty } from './components/call-history-empty/call-history-empty';
import { NewCallModal } from './components/new-call-modal/new-call-modal';
import { CallRecord, CallStatus } from './models/call-history.model';

interface FilterOption {
  id: 'all' | CallStatus;
  label: string;
}

@Component({
  selector: 'app-call-history',
  imports: [ButtonModule, LucideAngularModule, CallCard, CallHistorySkeleton, CallHistoryEmpty, NewCallModal],
  providers: [CallHistoryStore],
  templateUrl: './call-history.html',
  host: {
    class: 'block'
  }
})
export class CallHistory implements OnInit {
  readonly store = inject(CallHistoryStore);

  readonly phoneCallIcon = PhoneCall;
  readonly refreshIcon = RefreshCw;
  readonly filterIcon = Filter;

  readonly filters: FilterOption[] = [
    { id: 'all', label: 'All calls' },
    { id: CallStatus.Active, label: 'Live' },
    { id: CallStatus.Completed, label: 'Completed' },
    { id: CallStatus.Missed, label: 'Missed' },
    { id: CallStatus.Declined, label: 'Declined' }
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

  onJoinCall(call: CallRecord): void {
    // Future: navigate to call room
    console.log('Joining call:', call.id);
  }
}
