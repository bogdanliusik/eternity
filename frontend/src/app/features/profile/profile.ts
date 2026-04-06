import { Component, inject } from '@angular/core';
import { LoaderCircleIcon, LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';

import { AuthStore } from '@/core/auth/auth.store';

@Component({
  selector: 'app-profile',
  imports: [ButtonModule, LucideAngularModule],
  templateUrl: './profile.html'
})
export class Profile {
  public loadingCircleIcon = LoaderCircleIcon;
  readonly authStore = inject(AuthStore);
}
