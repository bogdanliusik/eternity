import { inject, Injectable } from '@angular/core';

import { CallRecord } from '@/features/call-history/models/call-history.model';

import { SignalRService } from './signalr.service';

export interface ParticipantJoinedEvent {
  callId: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ParticipantLeftEvent {
  callId: string;
  userId: string;
}

export interface ParticipantDeclinedEvent {
  callId: string;
  userId: string;
}

export interface PeerIdRegisteredEvent {
  userId: string;
  peerId: string;
}

export interface MediaStateChangedEvent {
  userId: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface CallEndedEvent {
  callId: string;
  reason: string;
}

export interface CallErrorEvent {
  message: string;
}

/**
 * SignalR hub service for the CallHub (/hubs/call).
 * Connected on-demand when a user enters a call room.
 */
@Injectable({ providedIn: 'root' })
export class CallHubService {
  private static readonly HUB_URL = '/hubs/call';
  private readonly signalR = inject(SignalRService);

  readonly callJoined$ = this.signalR.on<CallRecord>(CallHubService.HUB_URL, 'CallJoined');
  readonly participantJoined$ = this.signalR.on<ParticipantJoinedEvent>(CallHubService.HUB_URL, 'ParticipantJoined');
  readonly participantLeft$ = this.signalR.on<ParticipantLeftEvent>(CallHubService.HUB_URL, 'ParticipantLeft');
  readonly participantDeclined$ = this.signalR.on<ParticipantDeclinedEvent>(
    CallHubService.HUB_URL,
    'ParticipantDeclined'
  );
  readonly peerIdRegistered$ = this.signalR.on<PeerIdRegisteredEvent>(CallHubService.HUB_URL, 'PeerIdRegistered');
  readonly mediaStateChanged$ = this.signalR.on<MediaStateChangedEvent>(CallHubService.HUB_URL, 'MediaStateChanged');
  readonly callEnded$ = this.signalR.on<CallEndedEvent>(CallHubService.HUB_URL, 'CallEnded');
  readonly callLeft$ = this.signalR.on<{ callId: string }>(CallHubService.HUB_URL, 'CallLeft');
  readonly callError$ = this.signalR.on<string>(CallHubService.HUB_URL, 'CallError');

  async connect(): Promise<void> {
    return this.signalR.connect(CallHubService.HUB_URL);
  }

  async disconnect(): Promise<void> {
    return this.signalR.disconnect(CallHubService.HUB_URL);
  }

  get isConnected(): boolean {
    return this.signalR.isConnected(CallHubService.HUB_URL);
  }

  async joinCall(callId: string): Promise<void> {
    return this.signalR.invoke(CallHubService.HUB_URL, 'JoinCall', callId);
  }

  async leaveCall(callId: string): Promise<void> {
    return this.signalR.invoke(CallHubService.HUB_URL, 'LeaveCall', callId);
  }

  async registerPeerId(callId: string, peerId: string): Promise<void> {
    return this.signalR.invoke(CallHubService.HUB_URL, 'RegisterPeerId', callId, peerId);
  }

  async sendSignal(callId: string, targetUserId: string, signal: unknown): Promise<void> {
    return this.signalR.invoke(CallHubService.HUB_URL, 'SendSignal', callId, targetUserId, signal);
  }

  async notifyMediaStateChanged(callId: string, audioEnabled: boolean, videoEnabled: boolean): Promise<void> {
    return this.signalR.invoke(CallHubService.HUB_URL, 'NotifyMediaStateChanged', callId, audioEnabled, videoEnabled);
  }
}
