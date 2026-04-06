import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PopoverModule } from 'primeng/popover';

import { CallParticipant } from '../../models/call-history.model';

@Component({
  selector: 'app-participant-avatar-group',
  imports: [RouterLink, PopoverModule],
  templateUrl: './participant-avatar-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantAvatarGroup {
  readonly participants = input.required<CallParticipant[]>();
  readonly maxVisible = input<number>(3);

  readonly visibleParticipants = computed(() => this.participants().slice(0, this.maxVisible()));

  readonly hiddenCount = computed(() => Math.max(0, this.participants().length - this.maxVisible()));

  getInitials(fullName: string): string {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}
