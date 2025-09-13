import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../models/api.error';
import { ApiEnvelope } from '../models/api.envelope';
import { HttpRequestConfig } from '../models/http-request.config';

function toHttpParams(params?: HttpRequestConfig['params']): HttpParams | undefined {
  if (!params) return undefined;
  if (params instanceof HttpParams) return params;
  let hp = new HttpParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    hp = hp.set(k, String(v));
  }
  return hp;
}

@Injectable()
export class CoreHttpService {
  private readonly http = inject(HttpClient);

  get(url: string, config?: HttpRequestConfig): Observable<boolean>;
  get<T>(url: string, config?: HttpRequestConfig): Observable<T>;
  get<T = boolean>(url: string, config?: HttpRequestConfig): Observable<T | boolean> {
    return this.http
      .get<ApiEnvelope<T>>(url, {
        headers: config?.headers,
        params: toHttpParams(config?.params)
      })
      .pipe(
        map((envelope) => unwrapEnvelope<T>(envelope)),
        catchError((err) => throwEnvelopeError(err))
      );
  }

  post(url: string, body?: unknown, config?: HttpRequestConfig): Observable<boolean>;
  post<T>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T>;
  post<T = boolean>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T | boolean> {
    return this.http
      .post<ApiEnvelope<T>>(url, body, {
        headers: config?.headers,
        params: toHttpParams(config?.params)
      })
      .pipe(
        map((envelope) => unwrapEnvelope<T>(envelope)),
        catchError((err) => throwEnvelopeError(err))
      );
  }

  put(url: string, body?: unknown, config?: HttpRequestConfig): Observable<boolean>;
  put<T>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T>;
  put<T = boolean>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T | boolean> {
    return this.http
      .put<ApiEnvelope<T>>(url, body, {
        headers: config?.headers,
        params: toHttpParams(config?.params)
      })
      .pipe(
        map((envelope) => unwrapEnvelope<T>(envelope)),
        catchError((err) => throwEnvelopeError(err))
      );
  }

  patch(url: string, body?: unknown, config?: HttpRequestConfig): Observable<boolean>;
  patch<T>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T>;
  patch<T = boolean>(url: string, body?: unknown, config?: HttpRequestConfig): Observable<T | boolean> {
    return this.http
      .patch<ApiEnvelope<T>>(url, body, {
        headers: config?.headers,
        params: toHttpParams(config?.params)
      })
      .pipe(
        map((envelope) => unwrapEnvelope<T>(envelope)),
        catchError((err) => throwEnvelopeError(err))
      );
  }

  delete(url: string, config?: HttpRequestConfig): Observable<boolean>;
  delete<T>(url: string, config?: HttpRequestConfig): Observable<T>;
  delete<T = boolean>(url: string, config?: HttpRequestConfig): Observable<T | boolean> {
    return this.http
      .delete<ApiEnvelope<T>>(url, {
        headers: config?.headers,
        params: toHttpParams(config?.params)
      })
      .pipe(
        map((envelope) => unwrapEnvelope<T>(envelope)),
        catchError((err) => throwEnvelopeError(err))
      );
  }
}

function unwrapEnvelope<T>(envelope: ApiEnvelope<T>): T | boolean {
  if (!envelope?.succeeded || envelope?.isFailure) {
    const errs = envelope?.errors ?? [];
    throw new ApiError(undefined, errs, errs.join('; ') || 'Request failed');
  }
  if ('data' in envelope) {
    return envelope.data as T;
  }
  return true;
}

function throwEnvelopeError(err: any) {
  if (err?.error && typeof err.error === 'object' && 'errors' in err.error) {
    const e = err.error as ApiEnvelope<unknown>;
    return throwError(() => new ApiError(err.status, e.errors, e.errors?.join('; ') || err.message));
  }
  return throwError(() => new ApiError(err?.status, [], err?.message ?? 'Network error'));
}
