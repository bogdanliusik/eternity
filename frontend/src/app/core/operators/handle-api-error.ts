import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MonoTypeOperatorFunction, Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../models/api.error';

export interface HandleApiErrorOptions {
  rethrow?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiErrorHandler {
  private readonly messageService = inject(MessageService);

  handle<T>(options?: HandleApiErrorOptions): MonoTypeOperatorFunction<T> {
    const rethrow = options?.rethrow ?? true;
    return (source: Observable<T>) =>
      source.pipe(
        catchError((error: unknown) => {
          const apiError = error instanceof ApiError ? error : new ApiError(undefined, [String(error)]);
          if (apiError.errors.length > 0) {
            for (const errorMessage of apiError.errors) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 2500
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: apiError.message || 'An unexpected error occurred',
              life: 2500
            });
          }
          return rethrow ? throwError(() => apiError) : EMPTY;
        })
      );
  }
}
