import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  /**
   * Get pending registration requests count for menu badge.
   */
  getPendingRequestsCount(): Observable<number> {
    // TODO: Replace with actual API call
    // return this.http.get<number>('/api/admin/registration-requests/pending-count');

    // For now, return 0 - the actual count will come from the feature service
    // when the registration requests page loads
    return of(3); // Mock value for development
  }
}
