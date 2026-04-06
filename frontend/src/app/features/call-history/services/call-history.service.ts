import { inject,Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CallApiService } from '@/core/services/call-api.service';

import {
  CallHistoryRecord,
  CallRecord,
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
