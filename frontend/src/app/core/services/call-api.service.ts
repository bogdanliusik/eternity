import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CallHistoryRecord,
  CallRecord,
  NewCallRequest,
  UserSummary
} from '@/features/call-history/models/call-history.model';

import { CoreHttpService } from './core-http.service';

/**
 * HTTP service for call-related REST endpoints.
 * Talks to /api/calls and /api/users endpoints.
 */
@Injectable({ providedIn: 'root' })
export class CallApiService {
  private readonly http = inject(CoreHttpService);

  initiateCall(request: NewCallRequest): Observable<CallRecord> {
    return this.http.post<CallRecord>('/api/calls', request);
  }

  declineCall(callId: string): Observable<boolean> {
    return this.http.post(`/api/calls/${callId}/decline`);
  }

  getCallHistory(): Observable<CallHistoryRecord[]> {
    return this.http.get<CallHistoryRecord[]>('/api/calls/history');
  }

  getCall(callId: string): Observable<CallRecord> {
    return this.http.get<CallRecord>(`/api/calls/${callId}`);
  }

  searchUsers(search?: string): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>('/api/users/search', {
      params: search ? { search } : undefined
    });
  }
}
