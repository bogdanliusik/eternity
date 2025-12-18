import { inject, Injectable } from '@angular/core';
import { CoreHttpService } from '../services/core-http.service';
import { LoginRequest } from './models/login.request';
import { Observable } from 'rxjs';
import { CurrentUser } from './models/current.user';
import { ApiEnvelope } from '../models/api.envelope';

export interface RegisterRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(CoreHttpService);
  private readonly baseUrl = '/api/users';

  loginWithCookies(loginRequest: LoginRequest): Observable<ApiEnvelope<void>> {
    return this.http.post<void>(`${this.baseUrl}/loginCookie`, loginRequest, { raw: true });
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/getCurrentUser`);
  }

  register(registerRequest: RegisterRequest): Observable<ApiEnvelope<void>> {
    return this.http.post<void>('/api/registration-requests', registerRequest, { raw: true });
  }
}
