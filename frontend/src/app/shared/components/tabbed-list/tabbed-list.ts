import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, inject, OnInit, TemplateRef } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TabsModule } from 'primeng/tabs';
import { LucideAngularModule } from 'lucide-angular';
import { TabbedListConfig } from './tabbed-list.models';
import { TABBED_LIST_CONFIG, TabbedListStore } from './tabbed-list.store';
import { TabbedListEmptyState } from './components/tabbed-list-empty-state';
import { TabbedListSkeleton } from './components/tabbed-list-skeleton';

@Component({
  selector: 'app-tabbed-list',
  imports: [
    NgTemplateOutlet,
    BadgeModule,
    PaginatorModule,
    TabsModule,
    LucideAngularModule,
    TabbedListEmptyState,
    TabbedListSkeleton
  ],
  templateUrl: './tabbed-list.html'
})
export class TabbedList implements OnInit {
  readonly store = inject(TabbedListStore);
  readonly config = inject<TabbedListConfig>(TABBED_LIST_CONFIG);
  readonly contentTpl = contentChild('content', { read: TemplateRef });
  readonly skeletonTpl = contentChild('skeleton', { read: TemplateRef });

  ngOnInit(): void {
    this.store.load({ tab: this.config.defaultTab, page: 1 });
  }

  onTabChange(tabId: string): void {
    if (this.store.activeTab() !== tabId) {
      this.store.load({ tab: tabId });
    }
  }

  onPageChange(event: PaginatorState): void {
    const page = (event.page ?? 0) + 1;
    this.store.load({ page });
  }

  getTabCount(tabId: string): number | null {
    return this.store.tabCount()(tabId);
  }
}
