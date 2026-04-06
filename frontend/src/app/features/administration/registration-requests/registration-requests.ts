import { Component, inject, OnInit } from '@angular/core';
import { CircleCheckBig, CircleX,Clock, LucideAngularModule, RefreshCw } from 'lucide-angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { RequestTable } from './components/request-table/request-table';
import { RequestsEmptyState } from './components/requests-empty-state/requests-empty-state';
import { RequestsSkeleton } from './components/requests-skeleton/requests-skeleton';
import { RegistrationRequest, RegistrationRequestStatus } from './models/registration-request.model';
import { RequestTab } from './models/request-tab.model';
import { RegistrationRequestsStore } from './store/registration-requests.store';

@Component({
  selector: 'app-registration-requests',
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TabsModule,
    BadgeModule,
    LucideAngularModule,
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

  readonly statusEnum = RegistrationRequestStatus;

  readonly refreshIcon = RefreshCw;

  readonly tabs: RequestTab[] = [
    { id: RegistrationRequestStatus.Pending, label: 'Pending', icon: Clock },
    { id: RegistrationRequestStatus.Approved, label: 'Approved', icon: CircleCheckBig },
    { id: RegistrationRequestStatus.Rejected, label: 'Rejected', icon: CircleX }
  ];

  ngOnInit() {
    // Load all counts first for tab badges
    this.store.loadAllCounts();
    // Then load data for the default tab
    this.store.loadRequests(RegistrationRequestStatus.Pending);
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
