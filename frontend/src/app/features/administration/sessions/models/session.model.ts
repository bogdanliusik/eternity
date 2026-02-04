export enum SessionStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  ipAddress: string;
  deviceInfo: string;
  browserInfo: string;
  isActive: boolean;
  isCurrentSession: boolean;
  user: SessionUser;
}
