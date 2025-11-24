import { LucideComponent } from 'lucide-angular';

export interface SubMenuItem {
  icon?: typeof LucideComponent;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
}
