import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, RefreshCw, ShieldCheck } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { TabbedList } from '@/shared/components/tabbed-list/tabbed-list';
import { TabbedListStore } from '@/shared/components/tabbed-list/tabbed-list.store';

import { SessionsSkeleton } from './components/sessions-skeleton/sessions-skeleton';
import { SessionsTable } from './components/sessions-table/sessions-table';
import { SessionStatus } from './models/session.model';
import { sessionsProviders,SessionsStore } from './store/sessions.store';

@Component({
  selector: 'app-sessions',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    LucideAngularModule,
    TabbedList,
    SessionsTable,
    SessionsSkeleton
  ],
  providers: [sessionsProviders],
  templateUrl: './sessions.html'
})
export class Sessions {
  readonly listStore = inject(TabbedListStore);
  readonly sessionsStore = inject(SessionsStore);

  readonly refreshIcon = RefreshCw;
  readonly sessionsIcon = ShieldCheck;

  readonly activeSessionTab = computed(() => this.listStore.activeTab() as SessionStatus);

  formatCount(value: number | null): string {
    return value === null ? '--' : value.toString();
  }
}
