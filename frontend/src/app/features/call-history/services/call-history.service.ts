import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CallApiService } from '@/core/services/call-api.service';
import {
  CallRecord,
  CallHistoryRecord,
  NewCallRequest,
  UserSummary
} from '../models/call-history.model';

/**
 * Facade service for call history feature.
 * Delegates to CallApiService for all HTTP calls.
 */
@Injectable({
  providedIn: 'root'
})
export class CallHistoryService {
  private readonly callApi = inject(CallApiService);

  getCallHistory(): Observable<CallHistoryRecord[]> {
    return this.callApi.getCallHistory();
  }

  searchUsers(search: string): Observable<UserSummary[]> {
    return this.callApi.searchUsers(search || undefined);
  }

  createCall(request: NewCallRequest): Observable<CallRecord> {
    return this.callApi.initiateCall(request);
  }
}
