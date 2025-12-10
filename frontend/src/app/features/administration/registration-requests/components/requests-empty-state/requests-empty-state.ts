import { Component, input } from '@angular/core';
import { LucideAngularModule, Inbox } from 'lucide-angular';
import { RegistrationRequestStatus } from '../../models/registration-request.model';

export interface EmptyStateMessage {
  title: string;
  description: string;
}

const EMPTY_STATE_MESSAGES: Record<RegistrationRequestStatus, EmptyStateMessage> = {
  pending: {
    title: 'No pending requests',
    description: 'All registration requests have been processed'
  },
  approved: {
    title: 'No approved requests',
    description: 'No registration requests have been approved yet'
  },
  rejected: {
    title: 'No rejected requests',
    description: 'No registration requests have been rejected'
  }
};

@Component({
  selector: 'app-requests-empty-state',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <div class="bg-muted mb-4 rounded-full p-4">
        <lucide-icon [img]="inboxIcon" class="text-muted-foreground h-8 w-8"></lucide-icon>
      </div>
      <h3 class="text-color mb-1 text-lg font-semibold">{{ message.title }}</h3>
      <p class="text-muted-foreground text-sm">{{ message.description }}</p>
    </div>
  `
})
export class RequestsEmptyState {
  readonly activeTab = input.required<RegistrationRequestStatus>();
  readonly inboxIcon = Inbox;

  get message(): EmptyStateMessage {
    return EMPTY_STATE_MESSAGES[this.activeTab()];
  }
}
