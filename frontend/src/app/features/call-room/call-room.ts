import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Video,
  VideoOff} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { AuthStore } from '@/core/auth/auth.store';
import { CallApiService } from '@/core/services/call-api.service';
import { CallHubService, ParticipantJoinedEvent, ParticipantLeftEvent } from '@/core/services/call-hub.service';
import { IncomingCallService } from '@/core/services/incoming-call.service';
import { PeerService } from '@/core/services/peer.service';
import { CallParticipant,CallRecord, CallType } from '@/features/call-history/models/call-history.model';
import { SrcObjectDirective } from '@/shared/directives/src-object.directive';

export interface VideoTile {
  peerId: string;
  userId: string;
  label: string;
  initials: string;
  avatarUrl: string | null;
  stream: MediaStream | null;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

@Component({
  selector: 'app-call-room',
  imports: [ButtonModule, LucideAngularModule, SrcObjectDirective],
  templateUrl: './call-room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block overflow-hidden'
  },
  styles: [`
    :host {
      /*
       * Layout hierarchy: #main-content (flex-grow, overflow-auto)
       *   → contentClass div (py-4 px-4 sm:px-8 — no explicit height)
       *     → <app-call-room>
       *
       * #main-content scrolls when its child exceeds its height.
       * We negate the contentClass padding with negative margins so
       * the call room occupies the full #main-content area, and set
       * a viewport-based height that accounts for the navbar.
       *
       * Mobile (< lg): navbar ~69px due to taller hamburger button → use 4.375rem offset.
       * Desktop (lg+): navbar ~65px, no hamburger button → use 4.125rem offset.
       */
      margin: -1rem;
      height: calc(100dvh - 4.375rem - 1px);
    }
    @media (min-width: 640px) {
      :host {
        margin: -1rem -2rem;
      }
    }
    @media (min-width: 1024px) {
      :host {
        height: calc(100dvh - 4.125rem - 1px);
      }
    }
  `]
})
export class CallRoom implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly authStore = inject(AuthStore);
  readonly callHub = inject(CallHubService);
  readonly peerService = inject(PeerService);
  private readonly callApi = inject(CallApiService);
  private readonly incomingCallService = inject(IncomingCallService);

  readonly micIcon = Mic;
  readonly micOffIcon = MicOff;
  readonly videoIcon = Video;
  readonly videoOffIcon = VideoOff;
  readonly phoneOffIcon = PhoneOff;
  readonly monitorIcon = Monitor;

  readonly callId = signal<string>('');
  readonly call = signal<CallRecord | null>(null);
  readonly isJoining = signal(true);
  readonly audioEnabled = signal(true);
  readonly videoEnabled = signal(true);
  readonly callError = signal<string | null>(null);

  private readonly peerUserMap = new Map<string, string>();
  private readonly participantMap = new Map<string, CallParticipant>();
  private readonly remoteMediaState = signal<Map<string, { audioEnabled: boolean; videoEnabled: boolean }>>(new Map());

  readonly isVideoCall = computed(() => this.call()?.type === CallType.Video);

  readonly videoTiles = computed<VideoTile[]>(() => {
    const tiles: VideoTile[] = [];
    const currentUser = this.authStore.user();
    const mediaStates = this.remoteMediaState();

    const localStream = this.peerService.localStreamSignal();
    const localPeerId = this.peerService.peerId();
    if (localPeerId) {
      tiles.push({
        peerId: localPeerId,
        userId: 'local',
        label: 'You',
        initials: currentUser ? this.getInitials(currentUser.fullName) : '?',
        avatarUrl: currentUser?.avatarUrl ?? null,
        stream: localStream,
        isLocal: true,
        audioEnabled: this.audioEnabled(),
        videoEnabled: this.videoEnabled()
      });
    }

    for (const remote of this.peerService.remoteStreams()) {
      const participant = this.participantMap.get(remote.userId);
      const label = participant?.fullName || participant?.username || 'Participant';
      const remoteState = mediaStates.get(remote.userId);
      tiles.push({
        peerId: remote.peerId,
        userId: remote.userId,
        label,
        initials: this.getInitials(label),
        avatarUrl: participant?.avatarUrl ?? null,
        stream: remote.stream,
        isLocal: false,
        audioEnabled: remoteState?.audioEnabled ?? true,
        videoEnabled: remoteState?.videoEnabled ?? this.isVideoCall()
      });
    }

    return tiles;
  });

  readonly participantCount = computed(() => this.videoTiles().length);

  readonly gridClass = computed(() => {
    const count = this.videoTiles().length;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  });

  constructor() {
    this.callHub.callJoined$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((callData) => {
      this.handleCallJoined(callData);
    });

    this.callHub.participantJoined$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.handleParticipantJoined(event);
    });

    this.callHub.participantLeft$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.handleParticipantLeft(event);
    });

    this.callHub.peerIdRegistered$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.peerUserMap.set(event.peerId, event.userId);
      this.peerService.registerPeerUser(event.peerId, event.userId);
      this.peerService.updatePeerUserId(event.peerId, event.userId);
      this.peerService.callPeer(event.peerId, event.userId);
    });

    this.callHub.mediaStateChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.remoteMediaState.update((m) => {
        const next = new Map(m);
        next.set(event.userId, { audioEnabled: event.audioEnabled, videoEnabled: event.videoEnabled });
        return next;
      });
    });

    this.callHub.participantDeclined$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      const participant = this.participantMap.get(event.userId);
      const name = participant?.fullName ?? 'A participant';
      this.messageService.add({
        severity: 'warn',
        summary: `${name} declined the call`,
        life: 4000
      });
    });

    this.callHub.callEnded$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Call ended',
        detail: event.reason,
        life: 5000
      });
      this.leaveAndNavigateBack();
    });

    this.callHub.callError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
      this.callError.set(error);
      this.isJoining.set(false);
      this.cleanup();
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('callId');
    if (!id) {
      this.router.navigate(['/call-history']);
      return;
    }
    this.callId.set(id);
    this.initializeCall(id);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeCall(callId: string): Promise<void> {
    this.isJoining.set(true);

    this.callApi.getCall(callId).subscribe({
      next: async (callData) => {
        try {
          this.call.set(callData);
          this.populateParticipantMap(callData.participants);

          const isVideo = callData.type === CallType.Video;

          const peerId = await this.peerService.initialize(isVideo);

          // Honor pre-join media toggle state (user may have toggled mic/camera off in the pre-join modal)
          const preJoinCtx = this.incomingCallService.consumePreJoinContext();
          if (preJoinCtx) {
            if (preJoinCtx.audioEnabled === false) {
              this.peerService.toggleAudio();
            }
            if (isVideo && preJoinCtx.videoEnabled === false) {
              this.peerService.toggleVideo();
            }
          }

          this.audioEnabled.set(this.peerService.isAudioEnabled);
          this.videoEnabled.set(this.peerService.isVideoEnabled);

          await this.callHub.connect();
          await this.callHub.joinCall(callId);
          await this.callHub.registerPeerId(callId, peerId);

          // Broadcast initial media state so other participants know our mic/camera state
          this.broadcastMediaState();

          this.isJoining.set(false);
        } catch (err) {
          this.cleanup();
          if (err instanceof DOMException && err.name === 'NotAllowedError') {
            this.callError.set('Camera/microphone access denied. Please allow access in your browser settings and try again.');
          } else if (err instanceof DOMException && err.name === 'NotFoundError') {
            this.callError.set('No camera or microphone found. Please connect a device and try again.');
          } else if (err instanceof DOMException && err.name === 'NotReadableError') {
            this.callError.set('Camera or microphone is already in use by another application.');
          } else {
            const message = err instanceof Error ? err.message : 'Failed to join call';
            this.callError.set(message);
          }
          this.isJoining.set(false);
        }
      },
      error: (err) => {
        this.callError.set(err?.message ?? 'Failed to load call details');
        this.isJoining.set(false);
      }
    });
  }

  private handleCallJoined(callData: CallRecord): void {
    this.call.set(callData);
    this.populateParticipantMap(callData.participants);
  }

  private handleParticipantJoined(event: ParticipantJoinedEvent): void {
    this.messageService.add({
      severity: 'info',
      summary: `${event.fullName} joined`,
      life: 3000
    });
  }

  private handleParticipantLeft(event: ParticipantLeftEvent): void {
    const participant = this.participantMap.get(event.userId);
    const name = participant?.fullName ?? 'A participant';
    this.messageService.add({
      severity: 'info',
      summary: `${name} left`,
      life: 3000
    });

    const peerEntry = [...this.peerUserMap.entries()].find(([, uid]) => uid === event.userId);
    if (peerEntry) {
      this.peerService.removePeer(peerEntry[0]);
      this.peerUserMap.delete(peerEntry[0]);
    }

    this.remoteMediaState.update((m) => {
      const next = new Map(m);
      next.delete(event.userId);
      return next;
    });
  }

  private populateParticipantMap(participants: CallParticipant[]): void {
    for (const p of participants) {
      this.participantMap.set(p.userId, p);
    }
  }

  toggleAudio(): void {
    this.peerService.toggleAudio();
    this.audioEnabled.set(this.peerService.isAudioEnabled);
    this.broadcastMediaState();
  }

  toggleVideo(): void {
    this.peerService.toggleVideo();
    this.videoEnabled.set(this.peerService.isVideoEnabled);
    this.broadcastMediaState();
  }

  private broadcastMediaState(): void {
    const id = this.callId();
    if (id && this.callHub.isConnected) {
      this.callHub.notifyMediaStateChanged(id, this.audioEnabled(), this.videoEnabled()).catch(() => { /* fire-and-forget */ });
    }
  }

  async leaveCall(): Promise<void> {
    try {
      await this.callHub.leaveCall(this.callId());
    } catch {
      // intentionally empty
    }
    this.leaveAndNavigateBack();
  }

  private leaveAndNavigateBack(): void {
    this.cleanup();
    this.router.navigate(['/call-history']);
  }

  private cleanup(): void {
    this.peerService.destroy();
    this.callHub.disconnect();
    this.peerUserMap.clear();
    this.participantMap.clear();
    this.remoteMediaState.set(new Map());
  }

  /** Extract 1-2 character initials from a display name. */
  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  /**
   * Whether a tile should show video.
   * For local: checks our videoEnabled signal (authoritative).
   * For remote: checks the mediaStateChanged signal from SignalR (authoritative).
   * In both cases, the stream must exist and have at least one video track.
   */
  showVideo(tile: VideoTile): boolean {
    if (!tile.stream) return false;
    if (!tile.videoEnabled) return false;
    const videoTracks = tile.stream.getVideoTracks();
    return videoTracks.length > 0;
  }
}
