import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface HttpRequestConfig {
  headers?: HttpHeaders;
  params?: HttpParams | Record<string, string | number | boolean | null | undefined>;
}
