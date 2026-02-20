import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TabDefinition } from '../tabbed-list.models';

@Component({
  selector: 'app-tabbed-list-empty-state',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <div class="bg-muted mb-4 rounded-full p-4">
        <lucide-icon [img]="icon" class="text-muted-foreground h-8 w-8"></lucide-icon>
      </div>
      <h3 class="text-color mb-1 text-lg font-semibold">{{ tab().emptyState.title }}</h3>
      <p class="text-muted-foreground text-sm">{{ tab().emptyState.description }}</p>
    </div>
  `
})
export class TabbedListEmptyState {
  readonly tab = input.required<TabDefinition>();

  get icon() {
    return this.tab().emptyState.icon ?? this.tab().icon;
  }
}
