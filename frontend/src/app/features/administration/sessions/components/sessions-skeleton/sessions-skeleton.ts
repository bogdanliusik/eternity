import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-sessions-skeleton',
  imports: [SkeletonModule],
  template: `
    <div class="p-6">
      @for (i of skeletonItems; track i) {
        <div class="mb-4 flex items-center gap-4">
          <p-skeleton shape="circle" size="40px" />
          <div class="flex-1 space-y-2">
            <p-skeleton width="50%" height="16px" />
            <p-skeleton width="35%" height="12px" />
          </div>
          <div class="hidden w-40 space-y-2 lg:block">
            <p-skeleton width="100%" height="12px" />
            <p-skeleton width="70%" height="12px" />
          </div>
          <p-skeleton width="100px" height="32px" />
        </div>
      }
    </div>
  `
})
export class SessionsSkeleton {
  readonly skeletonItems = [1, 2, 3];
}
