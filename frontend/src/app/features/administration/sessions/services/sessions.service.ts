import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiErrorHandler } from '@/core/operators/handle-api-error';
import { CoreHttpService } from '@/core/services/core-http.service';

import { PingSessionRequest, PingSessionResponse } from '../models/ping-session.model';
import { SessionPage } from '../models/session-page.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly http = inject(CoreHttpService);
  private readonly errorHandler = inject(ApiErrorHandler);
  private readonly baseUrl = '/api/sessions';

  getSessions(isActive: boolean, pageNumber: number, pageSize: number): Observable<SessionPage> {
    return this.http
      .get<SessionPage>(`${this.baseUrl}/getAll`, {
        params: { isActive, pageNumber, pageSize }
      })
      .pipe(this.errorHandler.handle());
  }

  getOnlineSessions(pageNumber: number, pageSize: number): Observable<SessionPage> {
    return this.http
      .get<SessionPage>(`${this.baseUrl}/getAll`, {
        params: { isActive: true, isOnline: true, pageNumber, pageSize }
      })
      .pipe(this.errorHandler.handle());
  }

  terminateSession(sessionId: string): Observable<boolean> {
    return this.http.post(`${this.baseUrl}/terminate/${sessionId}`).pipe(this.errorHandler.handle());
  }

  pingSession(request: PingSessionRequest): Observable<PingSessionResponse> {
    return this.http.post<PingSessionResponse>(`${this.baseUrl}/pingSession`, request).pipe(this.errorHandler.handle());
  }
}
