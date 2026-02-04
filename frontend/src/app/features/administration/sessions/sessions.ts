import { Component, inject, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Activity, Archive, RefreshCw, ShieldCheck } from 'lucide-angular';
import { SessionsStore } from './store/sessions.store';
import { SessionsTable } from './components/sessions-table/sessions-table';
import { SessionsEmptyState } from './components/sessions-empty-state/sessions-empty-state';
import { SessionsSkeleton } from './components/sessions-skeleton/sessions-skeleton';
import { Session, SessionStatus } from './models/session.model';
import { SessionTab } from './models/session-tab.model';

@Component({
  selector: 'app-sessions',
  imports: [
    BadgeModule,
    ButtonModule,
    PaginatorModule,
    TabsModule,
    TagModule,
    TooltipModule,
    LucideAngularModule,
    SessionsTable,
    SessionsEmptyState,
    SessionsSkeleton
  ],
  providers: [SessionsStore],
  templateUrl: './sessions.html'
})
export class Sessions implements OnInit {
  readonly store = inject(SessionsStore);

  readonly refreshIcon = RefreshCw;
  readonly sessionsIcon = ShieldCheck;
  readonly statusEnum = SessionStatus;

  readonly tabs: SessionTab[] = [
    { id: SessionStatus.Active, label: 'Active', icon: Activity },
    { id: SessionStatus.Inactive, label: 'Inactive', icon: Archive }
  ];

  ngOnInit() {
    this.store.loadSessions({ tab: SessionStatus.Active, page: 1 });
  }

  onTabChange(tabId: SessionStatus) {
    if (this.store.activeTab() !== tabId) {
      const page = tabId === SessionStatus.Active ? this.store.activePage() : this.store.inactivePage();
      this.store.loadSessions({ tab: tabId, page });
    }
  }

  onPageChange(event: PaginatorState) {
    const page = (event.page ?? 0) + 1;
    this.store.loadSessions({ tab: this.store.activeTab(), page });
  }

  onTerminate(session: Session) {
    this.store.terminateSession(session);
  }

  onRefresh() {
    this.store.loadSessions({ tab: this.store.activeTab(), page: this.store.currentPage() });
  }

  getTabCount(tabId: SessionStatus): number | null {
    return this.store.getCount()(tabId);
  }

  formatCount(value: number | null): string {
    return value === null ? '--' : value.toString();
  }

  hasCurrentSession(): boolean {
    return this.store.activeSessions().some((session) => session.isCurrentSession);
  }
}
