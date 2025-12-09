import { SubMenuItem } from './sub-menu-item';

export interface MenuItem {
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  items: Array<SubMenuItem>;
  roles?: string[];
}
