import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, PhoneOff } from 'lucide-angular';

@Component({
  selector: 'app-call-history-empty',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg py-14">
      <div class="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
        <lucide-icon [img]="phoneOffIcon" class="text-muted-foreground h-7 w-7"></lucide-icon>
      </div>
      <h3 class="text-color mb-1 text-base font-semibold">No calls found</h3>
      <p class="text-muted-foreground text-sm">Try another filter or start a new call.</p>
    </div>
  `
})
export class CallHistoryEmpty {
  readonly phoneOffIcon = PhoneOff;
}
