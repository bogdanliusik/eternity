import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import EternityTheme from '@/core/themes/eternity-theme';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { initializeAuth } from './core/auth/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideAppInitializer(initializeAuth()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]), withInterceptorsFromDi()),
    provideAngularSvgIcon(),
    provideAnimationsAsync(),
    providePrimeNG({ theme: EternityTheme, ripple: false })
  ]
};
