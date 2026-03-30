export enum CallStatus {
  Active = 'active',
  Completed = 'completed',
  Missed = 'missed',
  Declined = 'declined'
}

export enum CallType {
  Audio = 'audio',
  Video = 'video'
}

export interface CallParticipant {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export interface CallRecord {
  id: string;
  name: string;
  type: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  participants: CallParticipant[];
  initiatedBy: CallParticipant;
}

export interface NewCallRequest {
  name: string;
  participantIds: string[];
}
