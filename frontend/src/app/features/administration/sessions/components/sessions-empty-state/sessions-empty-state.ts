import { Component, input } from '@angular/core';
import { LucideAngularModule, Activity, Archive } from 'lucide-angular';
import { SessionStatus } from '../../models/session.model';

export interface SessionsEmptyStateMessage {
  title: string;
  description: string;
  icon: typeof Activity;
}

const EMPTY_STATE_MESSAGES: Record<SessionStatus, SessionsEmptyStateMessage> = {
  [SessionStatus.Active]: {
    title: 'No active sessions',
    description: 'Everyone is signed out or sessions have expired.',
    icon: Activity
  },
  [SessionStatus.Inactive]: {
    title: 'No inactive sessions yet',
    description: 'Ended sessions will appear here for auditing.',
    icon: Archive
  }
};

@Component({
  selector: 'app-sessions-empty-state',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <div class="bg-muted mb-4 rounded-full p-4">
        <lucide-icon [img]="message.icon" class="text-muted-foreground h-8 w-8"></lucide-icon>
      </div>
      <h3 class="text-color mb-1 text-lg font-semibold">{{ message.title }}</h3>
      <p class="text-muted-foreground text-sm">{{ message.description }}</p>
    </div>
  `
})
export class SessionsEmptyState {
  readonly activeTab = input.required<SessionStatus>();

  get message(): SessionsEmptyStateMessage {
    return EMPTY_STATE_MESSAGES[this.activeTab()];
  }
}
