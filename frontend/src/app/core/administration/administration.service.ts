import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoreHttpService } from '../services/core-http.service';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private readonly http = inject(CoreHttpService);

  /**
   * Get pending registration requests count for menu badge.
   */
  getPendingRequestsCount(): Observable<number> {
    return this.http.get<number>('/api/registration-requests/pending-count');
  }
}
