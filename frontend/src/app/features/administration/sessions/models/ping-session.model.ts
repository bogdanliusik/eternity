export interface PingSessionRequest {
  sessionId: string;
  message: string;
}

export interface PingSessionResponse {
  delivered: boolean;
}
