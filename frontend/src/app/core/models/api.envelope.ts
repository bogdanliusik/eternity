export interface ApiEnvelope<T = unknown> {
  succeeded: boolean;
  errors: string[];
  data?: T;
  isFailure: boolean;
}
