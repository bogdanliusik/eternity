import { Component } from '@angular/core';

@Component({
  selector: 'app-call-history-skeleton',
  imports: [],
  template: `
    <div class="space-y-3">
      @for (i of skeletonRows; track i) {
        <div class="rounded-lg px-3 py-3">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-1/4 animate-pulse rounded bg-white/8"></div>
              <div class="h-3 w-2/3 animate-pulse rounded bg-white/8"></div>
              <div class="h-3 w-1/2 animate-pulse rounded bg-white/8"></div>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-7 w-7 animate-pulse rounded-full bg-white/8"></div>
              <div class="h-7 w-7 animate-pulse rounded-full bg-white/8"></div>
              <div class="h-8 w-16 animate-pulse rounded-lg bg-white/8"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CallHistorySkeleton {
  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);
}
