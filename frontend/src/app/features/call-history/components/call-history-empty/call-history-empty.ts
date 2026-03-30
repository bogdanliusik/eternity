import { Component } from '@angular/core';
import { LucideAngularModule, PhoneOff } from 'lucide-angular';

@Component({
  selector: 'app-call-history-empty',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg py-14">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
        <lucide-icon [img]="phoneOffIcon" class="h-7 w-7 text-zinc-500"></lucide-icon>
      </div>
      <h3 class="mb-1 text-base font-semibold text-zinc-100">No calls found</h3>
      <p class="text-sm text-zinc-400">Try another filter or start a new call.</p>
    </div>
  `
})
export class CallHistoryEmpty {
  readonly phoneOffIcon = PhoneOff;
}
