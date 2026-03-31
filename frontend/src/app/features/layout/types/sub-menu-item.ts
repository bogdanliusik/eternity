import { LucideComponent } from 'lucide-angular';

export interface SubMenuItem {
  icon?: typeof LucideComponent;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
  badge?: string;
  badgeCount?: number;
  roles?: string[];
  /** Additional URL prefixes that should also mark this item as active. */
  additionalActiveRoutes?: string[];
}
