import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Session, SessionStatus } from '../../models/session.model';

@Component({
  selector: 'app-sessions-table',
  imports: [DatePipe, TableModule, ButtonModule, TagModule, TooltipModule, ClipboardModule],
  templateUrl: './sessions-table.html'
})
export class SessionsTable {
  readonly sessions = input.required<Session[]>();
  readonly activeTab = input.required<SessionStatus>();
  readonly processingIds = input.required<string[]>();

  readonly statusEnum = SessionStatus;
  readonly terminate = output<Session>();

  isProcessing(id: string): boolean {
    return this.processingIds().includes(id);
  }

  onTerminate(session: Session): void {
    this.terminate.emit(session);
  }

  getShortId(value: string): string {
    if (!value) return '--';
    return `${value.slice(0, 8)}...${value.slice(-4)}`;
  }

  getDisplayName(session: Session): string {
    const fullName = session.user?.fullName?.trim();
    if (fullName) return fullName;
    return session.user?.username?.trim() || '--';
  }

  getUserInitials(session: Session): string {
    const source = session.user?.fullName?.trim() || session.user?.username?.trim() || '';
    if (!source) return '--';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  hasAvatar(session: Session): boolean {
    return Boolean(session.user?.avatarUrl && session.user.avatarUrl.trim().length > 0);
  }
}
