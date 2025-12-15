import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-requests-skeleton',
  imports: [SkeletonModule],
  template: `
    <div class="p-6">
      @for (i of skeletonItems; track i) {
        <div class="mb-4 flex items-center gap-4">
          <p-skeleton shape="circle" size="40px" />
          <div class="flex-1">
            <p-skeleton width="60%" height="16px" styleClass="mb-2" />
            <p-skeleton width="40%" height="14px" />
          </div>
          <p-skeleton width="100px" height="32px" />
        </div>
      }
    </div>
  `
})
export class RequestsSkeleton {
  readonly skeletonItems = [1, 2, 3];
}
