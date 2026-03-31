import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { SignalRService } from './signalr.service';
import { IncomingCallNotification } from '@/features/call-history/models/call-history.model';

/**
 * SignalR hub service for the GeneralHub (/hubs/general).
 * Always connected when the user is authenticated.
 * Handles: admin messages, incoming call notifications, call declined/ended.
 */
@Injectable({ providedIn: 'root' })
export class GeneralHubService {
  private static readonly HUB_URL = '/hubs/general';
  private readonly signalR = inject(SignalRService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Existing events
  readonly messages$ = this.signalR.on<string>(GeneralHubService.HUB_URL, 'ReceiveMessage');

  // Call notification events
  readonly incomingCall$ = this.signalR.on<IncomingCallNotification>(GeneralHubService.HUB_URL, 'IncomingCall');
  readonly callDeclined$ = this.signalR.on<{ callId: string; userId: string }>(
    GeneralHubService.HUB_URL,
    'CallDeclined'
  );
  readonly callEnded$ = this.signalR.on<{ callId: string; reason: string }>(GeneralHubService.HUB_URL, 'CallEnded');

  constructor() {
    this.messages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Admin Message',
        detail: message,
        life: 8000
      });
    });
  }

  async connect(): Promise<void> {
    return this.signalR.connect(GeneralHubService.HUB_URL);
  }

  async disconnect(): Promise<void> {
    return this.signalR.disconnect(GeneralHubService.HUB_URL);
  }

  get isConnected(): boolean {
    return this.signalR.isConnected(GeneralHubService.HUB_URL);
  }
}
