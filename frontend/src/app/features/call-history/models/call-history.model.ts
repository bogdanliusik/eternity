export enum CallStatus {
  Active = 0,
  Completed = 1,
  Missed = 2,
  Cancelled = 3,
  Declined = 4
}

export enum CallType {
  Audio = 0,
  Video = 1
}

export enum ParticipantStatus {
  Ringing = 0,
  Joined = 1,
  Left = 2,
  Declined = 3,
  Missed = 4
}

export enum CallDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing'
}

export interface CallParticipant {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  participantStatus: ParticipantStatus;
  joinedAt: string | null;
  leftAt: string | null;
}

export interface CallRecord {
  id: string;
  name: string | null;
  type: CallType;
  status: CallStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  participants: CallParticipant[];
  initiatedBy: CallParticipant;
}

export interface CallHistoryRecord extends CallRecord {
  userParticipantStatus: ParticipantStatus;
}

/**
 * Derives the display status for a call from the current user's perspective.
 * A call that is globally Completed/Cancelled can appear as Missed or Declined
 * for a user who never joined.
 */
export function deriveUserDisplayStatus(record: CallHistoryRecord): CallStatus {
  if (record.status === CallStatus.Active) {
    return CallStatus.Active;
  }
  if (record.userParticipantStatus === ParticipantStatus.Missed) {
    return CallStatus.Missed;
  }
  if (record.userParticipantStatus === ParticipantStatus.Declined) {
    return CallStatus.Declined;
  }
  return record.status;
}

/**
 * Determines call direction from the current user's perspective.
 * Outgoing = the user initiated the call; Incoming = someone else did.
 */
export function deriveCallDirection(record: CallRecord, currentUserId: string): CallDirection {
  return record.initiatedBy.userId === currentUserId ? CallDirection.Outgoing : CallDirection.Incoming;
}

export interface NewCallRequest {
  inviteeIds: string[];
  type: CallType;
  name?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

export interface IncomingCallNotification {
  callId: string;
  callType: CallType;
  initiator: {
    userId: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  participants: {
    userId: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
    participantStatus: ParticipantStatus;
  }[];
}
