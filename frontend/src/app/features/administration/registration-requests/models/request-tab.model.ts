import { LucideIconData } from 'lucide-angular';
import { RegistrationRequestStatus } from './registration-request.model';

export interface RequestTab {
  id: RegistrationRequestStatus;
  label: string;
  icon: LucideIconData;
}
