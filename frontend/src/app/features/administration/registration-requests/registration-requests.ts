import { Component, inject, OnInit } from '@angular/core';
import { AdministrationStore } from '@/core/administration/administration.store';
import { DatePipe, NgClass } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { RegistrationRequest, RegistrationRequestStatus } from '@/core/administration/models/registration-request';
import {
  LucideAngularModule,
  UserCheck,
  UserX,
  RefreshCw,
  Inbox,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-angular';

interface Tab {
  id: RegistrationRequestStatus;
  label: string;
  icon: typeof Clock;
}

@Component({
  selector: 'app-registration-requests',
  imports: [DatePipe, NgClass, TableModule, ButtonModule, TagModule, TooltipModule, SkeletonModule, LucideAngularModule],
  templateUrl: './registration-requests.html',
  styleUrl: './registration-requests.css'
})
export class RegistrationRequests implements OnInit {
  readonly adminStore = inject(AdministrationStore);

  // Icons
  readonly userCheckIcon = UserCheck;
  readonly userXIcon = UserX;
  readonly refreshIcon = RefreshCw;
  readonly inboxIcon = Inbox;
  readonly clockIcon = Clock;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;

  // Tabs configuration
  readonly tabs: Tab[] = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle }
  ];

  ngOnInit() {
    this.adminStore.loadRequests('pending');
  }

  onTabChange(tab: RegistrationRequestStatus) {
    if (this.adminStore.activeTab() !== tab) {
      this.adminStore.loadRequests(tab);
    }
  }

  onApprove(request: RegistrationRequest) {
    this.adminStore.approveRequest(request.id);
  }

  onReject(request: RegistrationRequest) {
    this.adminStore.rejectRequest(request.id);
  }

  onRefresh() {
    this.adminStore.loadRequests(this.adminStore.activeTab());
  }

  isProcessing(id: string): boolean {
    return this.adminStore.processingIds().includes(id);
  }

  getTabCount(tabId: RegistrationRequestStatus): number {
    if (tabId === 'pending') return this.adminStore.pendingRequests().length;
    if (tabId === 'approved') return this.adminStore.approvedRequests().length;
    return this.adminStore.rejectedRequests().length;
  }

  getEmptyStateMessage(): { title: string; description: string } {
    const tab = this.adminStore.activeTab();
    if (tab === 'pending') {
      return {
        title: 'No pending requests',
        description: 'All registration requests have been processed'
      };
    }
    if (tab === 'approved') {
      return {
        title: 'No approved requests',
        description: 'No registration requests have been approved yet'
      };
    }
    return {
      title: 'No rejected requests',
      description: 'No registration requests have been rejected'
    };
  }
}
