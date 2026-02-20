import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { SignalRService } from './signalr.service';

@Injectable({ providedIn: 'root' })
export class GeneralHubService {
  private static readonly HUB_URL = '/hubs/general';
  private readonly signalR = inject(SignalRService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly messages$ = this.signalR.on<string>(GeneralHubService.HUB_URL, 'ReceiveMessage');

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
