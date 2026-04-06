import { LucideIconData } from 'lucide-angular';
import { Observable } from 'rxjs';

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIconData;
  badgeSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  emptyState: {
    title: string;
    description: string;
    icon?: LucideIconData;
  };
}

export interface TabbedListConfig {
  tabs: TabDefinition[];
  defaultTab: string;
  pageSize: number;
  itemId: (item: unknown) => string;
  loadFn: (tabId: string, page: number, pageSize: number) => Observable<PaginatedResult<unknown>>;
}
