import { LucideIconData } from 'lucide-angular';

import { SessionStatus } from './session.model';

export interface SessionTab {
  id: SessionStatus;
  label: string;
  icon: LucideIconData;
}
