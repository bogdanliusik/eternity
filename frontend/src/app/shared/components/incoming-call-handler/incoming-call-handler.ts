import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, Phone, PhoneOff } from 'lucide-angular';
import { Toast } from 'primeng/toast';

import { IncomingCallService } from '@/core/services/incoming-call.service';
import { PreJoinModal } from '@/shared/components/pre-join-modal/pre-join-modal';

/**
 * Hosts incoming-call toast (with Accept/Decline buttons) and pre-join modal.
 * Place once inside the Layout so it is active for all authenticated routes.
 */
@Component({
  selector: 'app-incoming-call-handler',
  imports: [Toast, LucideAngularModule, PreJoinModal],
  templateUrl: './incoming-call-handler.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomingCallHandler {
  private readonly incomingCallService = inject(IncomingCallService);

  readonly phoneIcon = Phone;
  readonly phoneOffIcon = PhoneOff;

  onAccept(): void {
    this.incomingCallService.openPreJoin();
  }

  onDecline(): void {
    this.incomingCallService.declineCall();
  }
}
