import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { LucideAngularModule, Phone, PhoneCall,Video } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { AuthStore } from '@/core/auth/auth.store';

import { CallDirection, CallHistoryRecord, CallStatus, CallType, deriveCallDirection,deriveUserDisplayStatus } from '../../models/call-history.model';
import { ParticipantAvatarGroup } from '../participant-avatar-group/participant-avatar-group';
import { StatusPill } from '../status-pill/status-pill';

@Component({
  selector: 'app-call-card',
  imports: [NgClass, ButtonModule, LucideAngularModule, StatusPill, ParticipantAvatarGroup],
  templateUrl: './call-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block'
  }
})
export class CallCard {
  readonly call = input.required<CallHistoryRecord>();
  readonly joinCall = output<CallHistoryRecord>();

  private readonly authStore = inject(AuthStore);

  readonly phoneIcon = Phone;
  readonly videoIcon = Video;
  readonly phoneCallIcon = PhoneCall;

  /** The display status from the current user's perspective. */
  readonly displayStatus = computed(() => deriveUserDisplayStatus(this.call()));

  /** Whether the call is incoming or outgoing relative to the current user. */
  readonly direction = computed(() => {
    const userId = this.authStore.user()?.id;
    if (!userId) return CallDirection.Incoming;
    return deriveCallDirection(this.call(), userId);
  });

  onJoin(): void {
    this.joinCall.emit(this.call());
  }

  getTypeIcon() {
    return this.call().type === CallType.Video ? this.videoIcon : this.phoneIcon;
  }

  getTypeLabel(): string {
    return this.call().type === CallType.Video ? 'Video' : 'Audio';
  }

  formatDuration(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    if (hrs > 0) {
      return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
    }
    return `${mins}m`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else if (diffDays < 7) {
      const dayName = date.toLocaleDateString([], { weekday: 'short' });
      return `${dayName} at ${timeStr}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
  }

  isActive(): boolean {
    return this.displayStatus() === CallStatus.Active;
  }

  isCompleted(): boolean {
    return this.displayStatus() === CallStatus.Completed;
  }

  isMissed(): boolean {
    return this.displayStatus() === CallStatus.Missed;
  }
}
