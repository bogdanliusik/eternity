import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { LucideAngularModule, RefreshCw, Clock, CircleCheckBig, CircleX } from 'lucide-angular';
import { RequestTabBadge } from './components/request-tab-badge/request-tab-badge';
import { RequestsEmptyState } from './components/requests-empty-state/requests-empty-state';
import { RequestsSkeleton } from './components/requests-skeleton/requests-skeleton';
import { RequestTable } from './components/request-table/request-table';
import { RegistrationRequestsStore } from './store/registration-requests.store';
import { RegistrationRequest, RegistrationRequestStatus } from './models/registration-request.model';
import { RequestTab } from './models/request-tab.model';

@Component({
  selector: 'app-registration-requests',
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TabsModule,
    LucideAngularModule,
    RequestTabBadge,
    RequestsEmptyState,
    RequestsSkeleton,
    RequestTable
  ],
  providers: [RegistrationRequestsStore],
  templateUrl: './registration-requests.html',
  styleUrl: './registration-requests.css'
})
export class RegistrationRequests implements OnInit {
  readonly store = inject(RegistrationRequestsStore);

  readonly refreshIcon = RefreshCw;

  readonly tabs: RequestTab[] = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CircleCheckBig },
    { id: 'rejected', label: 'Rejected', icon: CircleX }
  ];

  ngOnInit() {
    // Load all counts first for tab badges
    this.store.loadAllCounts();
    // Then load data for the default tab
    this.store.loadRequests('pending');
  }

  onTabChange(tabId: RegistrationRequestStatus) {
    if (this.store.activeTab() !== tabId) {
      this.store.loadRequests(tabId);
    }
  }

  onApprove(request: RegistrationRequest) {
    this.store.approveRequest(request.id);
  }

  onReject(request: RegistrationRequest) {
    this.store.rejectRequest(request.id);
  }

  onRefresh() {
    this.store.loadRequests(this.store.activeTab());
  }

  getTabCount(tabId: RegistrationRequestStatus): number {
    return this.store.getCount()(tabId);
  }
}
