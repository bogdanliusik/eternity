import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CallRecord, CallStatus, CallType, CallParticipant, NewCallRequest } from '../models/call-history.model';

const MOCK_AVATARS = [
  'https://i.pravatar.cc/150?u=alice',
  'https://i.pravatar.cc/150?u=bob',
  'https://i.pravatar.cc/150?u=charlie',
  'https://i.pravatar.cc/150?u=diana',
  'https://i.pravatar.cc/150?u=eve',
  'https://i.pravatar.cc/150?u=frank',
  'https://i.pravatar.cc/150?u=grace',
  'https://i.pravatar.cc/150?u=hank',
  'https://i.pravatar.cc/150?u=ivy',
  'https://i.pravatar.cc/150?u=jack'
];

const MOCK_USERS: CallParticipant[] = [
  {
    id: '1',
    username: 'alice',
    fullName: 'Alice Johnson',
    avatarUrl: MOCK_AVATARS[0],
    isOnline: true,
    joinedAt: '2026-02-23T09:00:00Z',
    leftAt: null
  },
  {
    id: '2',
    username: 'bob',
    fullName: 'Bob Smith',
    avatarUrl: MOCK_AVATARS[1],
    isOnline: true,
    joinedAt: '2026-02-23T09:01:00Z',
    leftAt: null
  },
  {
    id: '3',
    username: 'charlie',
    fullName: 'Charlie Brown',
    avatarUrl: MOCK_AVATARS[2],
    isOnline: false,
    joinedAt: '2026-02-23T09:02:00Z',
    leftAt: '2026-02-23T09:30:00Z'
  },
  {
    id: '4',
    username: 'diana',
    fullName: 'Diana Prince',
    avatarUrl: MOCK_AVATARS[3],
    isOnline: true,
    joinedAt: '2026-02-23T09:00:00Z',
    leftAt: null
  },
  {
    id: '5',
    username: 'eve',
    fullName: 'Eve Williams',
    avatarUrl: MOCK_AVATARS[4],
    isOnline: false,
    joinedAt: '2026-02-23T10:00:00Z',
    leftAt: '2026-02-23T10:45:00Z'
  },
  {
    id: '6',
    username: 'frank',
    fullName: 'Frank Castle',
    avatarUrl: MOCK_AVATARS[5],
    isOnline: true,
    joinedAt: '2026-02-23T10:05:00Z',
    leftAt: null
  },
  {
    id: '7',
    username: 'grace',
    fullName: 'Grace Hopper',
    avatarUrl: MOCK_AVATARS[6],
    isOnline: false,
    joinedAt: '2026-02-23T08:00:00Z',
    leftAt: '2026-02-23T08:50:00Z'
  },
  {
    id: '8',
    username: 'hank',
    fullName: 'Hank Pym',
    avatarUrl: MOCK_AVATARS[7],
    isOnline: true,
    joinedAt: '2026-02-23T11:00:00Z',
    leftAt: null
  },
  {
    id: '9',
    username: 'ivy',
    fullName: 'Ivy Chen',
    avatarUrl: MOCK_AVATARS[8],
    isOnline: false,
    joinedAt: '2026-02-23T07:30:00Z',
    leftAt: '2026-02-23T08:15:00Z'
  },
  {
    id: '10',
    username: 'jack',
    fullName: 'Jack Ryan',
    avatarUrl: MOCK_AVATARS[9],
    isOnline: true,
    joinedAt: '2026-02-23T12:00:00Z',
    leftAt: null
  }
];

const MOCK_CALLS: CallRecord[] = [
  {
    id: 'call-1',
    name: 'Sprint Planning',
    type: CallType.Video,
    status: CallStatus.Active,
    startedAt: '2026-02-23T14:00:00Z',
    endedAt: null,
    durationSeconds: null,
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[3], MOCK_USERS[5], MOCK_USERS[7]],
    initiatedBy: MOCK_USERS[0]
  },
  {
    id: 'call-2',
    name: 'Design Review',
    type: CallType.Video,
    status: CallStatus.Completed,
    startedAt: '2026-02-23T11:00:00Z',
    endedAt: '2026-02-23T12:30:00Z',
    durationSeconds: 5400,
    participants: [MOCK_USERS[0], MOCK_USERS[2], MOCK_USERS[4]],
    initiatedBy: MOCK_USERS[2]
  },
  {
    id: 'call-3',
    name: 'Quick Sync',
    type: CallType.Audio,
    status: CallStatus.Completed,
    startedAt: '2026-02-23T09:30:00Z',
    endedAt: '2026-02-23T09:45:00Z',
    durationSeconds: 900,
    participants: [MOCK_USERS[1], MOCK_USERS[3]],
    initiatedBy: MOCK_USERS[1]
  },
  {
    id: 'call-4',
    name: 'Client Presentation',
    type: CallType.Video,
    status: CallStatus.Active,
    startedAt: '2026-02-23T13:30:00Z',
    endedAt: null,
    durationSeconds: null,
    participants: [
      MOCK_USERS[0],
      MOCK_USERS[1],
      MOCK_USERS[2],
      MOCK_USERS[3],
      MOCK_USERS[4],
      MOCK_USERS[5],
      MOCK_USERS[6],
      MOCK_USERS[7]
    ],
    initiatedBy: MOCK_USERS[0]
  },
  {
    id: 'call-5',
    name: 'Backend Architecture Discussion',
    type: CallType.Audio,
    status: CallStatus.Missed,
    startedAt: '2026-02-23T08:00:00Z',
    endedAt: '2026-02-23T08:00:30Z',
    durationSeconds: 30,
    participants: [MOCK_USERS[6], MOCK_USERS[8]],
    initiatedBy: MOCK_USERS[6]
  },
  {
    id: 'call-6',
    name: 'Team Standup',
    type: CallType.Video,
    status: CallStatus.Completed,
    startedAt: '2026-02-22T09:00:00Z',
    endedAt: '2026-02-22T09:15:00Z',
    durationSeconds: 900,
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[3], MOCK_USERS[4], MOCK_USERS[5]],
    initiatedBy: MOCK_USERS[0]
  },
  {
    id: 'call-7',
    name: 'One-on-One with Manager',
    type: CallType.Video,
    status: CallStatus.Completed,
    startedAt: '2026-02-22T14:00:00Z',
    endedAt: '2026-02-22T14:30:00Z',
    durationSeconds: 1800,
    participants: [MOCK_USERS[0], MOCK_USERS[7]],
    initiatedBy: MOCK_USERS[7]
  },
  {
    id: 'call-8',
    name: 'Deployment Coordination',
    type: CallType.Audio,
    status: CallStatus.Declined,
    startedAt: '2026-02-22T16:00:00Z',
    endedAt: '2026-02-22T16:00:10Z',
    durationSeconds: 10,
    participants: [MOCK_USERS[1], MOCK_USERS[5], MOCK_USERS[9]],
    initiatedBy: MOCK_USERS[5]
  },
  {
    id: 'call-9',
    name: 'Product Roadmap Review',
    type: CallType.Video,
    status: CallStatus.Completed,
    startedAt: '2026-02-21T10:00:00Z',
    endedAt: '2026-02-21T11:00:00Z',
    durationSeconds: 3600,
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[3], MOCK_USERS[7], MOCK_USERS[9]],
    initiatedBy: MOCK_USERS[3]
  },
  {
    id: 'call-10',
    name: 'Bug Triage',
    type: CallType.Audio,
    status: CallStatus.Completed,
    startedAt: '2026-02-21T15:00:00Z',
    endedAt: '2026-02-21T15:20:00Z',
    durationSeconds: 1200,
    participants: [MOCK_USERS[2], MOCK_USERS[4], MOCK_USERS[8]],
    initiatedBy: MOCK_USERS[2]
  },
  {
    id: 'call-11',
    name: 'Interview — Senior Frontend Dev',
    type: CallType.Video,
    status: CallStatus.Completed,
    startedAt: '2026-02-20T13:00:00Z',
    endedAt: '2026-02-20T14:00:00Z',
    durationSeconds: 3600,
    participants: [MOCK_USERS[0], MOCK_USERS[7]],
    initiatedBy: MOCK_USERS[0]
  },
  {
    id: 'call-12',
    name: 'Infrastructure Cost Review',
    type: CallType.Video,
    status: CallStatus.Missed,
    startedAt: '2026-02-20T11:00:00Z',
    endedAt: '2026-02-20T11:01:00Z',
    durationSeconds: 60,
    participants: [MOCK_USERS[5], MOCK_USERS[9]],
    initiatedBy: MOCK_USERS[9]
  }
];

@Injectable({
  providedIn: 'root'
})
export class CallHistoryService {
  getCalls(): Observable<CallRecord[]> {
    return of(MOCK_CALLS).pipe(delay(600));
  }

  getAvailableParticipants(search: string): Observable<CallParticipant[]> {
    const filtered = search
      ? MOCK_USERS.filter(
          (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase())
        )
      : MOCK_USERS;
    return of(filtered).pipe(delay(300));
  }

  createCall(request: NewCallRequest): Observable<CallRecord> {
    const participants = MOCK_USERS.filter((u) => request.participantIds.includes(u.id));
    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      name: request.name,
      type: CallType.Video,
      status: CallStatus.Active,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSeconds: null,
      participants,
      initiatedBy: MOCK_USERS[0]
    };
    return of(newCall).pipe(delay(500));
  }
}
