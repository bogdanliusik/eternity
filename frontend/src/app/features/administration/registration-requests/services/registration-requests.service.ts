import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiErrorHandler } from '@/core/operators/handle-api-error';
import { CoreHttpService } from '@/core/services/core-http.service';

import { RegistrationRequest, RegistrationRequestStatus } from '../models/registration-request.model';

export interface AllRequestsCounts {
  pending: number;
  approved: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationRequestsService {
  private readonly http = inject(CoreHttpService);
  private readonly errorHandler = inject(ApiErrorHandler);
  private readonly baseUrl = '/api/registration-requests';

  getAllCounts(): Observable<AllRequestsCounts> {
    return this.http.get<AllRequestsCounts>(`${this.baseUrl}/counts`).pipe(
      this.errorHandler.handle()
    );
  }

  getRequests(status: RegistrationRequestStatus): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(`${this.baseUrl}`, { params: { status } }).pipe(
      this.errorHandler.handle()
    );
  }

  approveRequest(id: string): Observable<RegistrationRequest> {
    return this.http.post<RegistrationRequest>(`${this.baseUrl}/${id}/approve`).pipe(
      this.errorHandler.handle()
    );
  }

  rejectRequest(id: string): Observable<RegistrationRequest> {
    return this.http.post<RegistrationRequest>(`${this.baseUrl}/${id}/reject`).pipe(
      this.errorHandler.handle()
    );
  }
}
