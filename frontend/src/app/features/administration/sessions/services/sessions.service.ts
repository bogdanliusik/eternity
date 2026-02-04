import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoreHttpService } from '@/core/services/core-http.service';
import { ApiErrorHandler } from '@/core/operators/handle-api-error';
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
      .get<SessionPage>(`${this.baseUrl}/getAll`, { params: { isActive, pageNumber, pageSize } })
      .pipe(this.errorHandler.handle());
  }

  terminateSession(sessionId: string): Observable<boolean> {
    return this.http.post(`${this.baseUrl}/terminate/${sessionId}`).pipe(this.errorHandler.handle());
  }
}
