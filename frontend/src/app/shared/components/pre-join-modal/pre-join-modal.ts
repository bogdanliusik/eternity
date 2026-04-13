import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { LucideAngularModule, Mic, MicOff, Phone, PhoneOff, Video, VideoOff, X } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { IncomingCallService } from '@/core/services/incoming-call.service';
import { CallType } from '@/features/call-history/models/call-history.model';
import { SrcObjectDirective } from '@/shared/directives/src-object.directive';

@Component({
  selector: 'app-pre-join-modal',
  imports: [DialogModule, ButtonModule, LucideAngularModule, SrcObjectDirective],
  templateUrl: './pre-join-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreJoinModal {
  readonly incomingCallService = inject(IncomingCallService);

  readonly phoneIcon = Phone;
  readonly phoneOffIcon = PhoneOff;
  readonly videoIcon = Video;
  readonly videoOffIcon = VideoOff;
  readonly micIcon = Mic;
  readonly micOffIcon = MicOff;
  readonly xIcon = X;

  readonly localStream = signal<MediaStream | null>(null);
  readonly audioEnabled = signal(true);
  readonly videoEnabled = signal(true);
  readonly mediaError = signal<string | null>(null);

  /** Guard flag: prevents onClose/dismiss from wiping the preJoinContext during join navigation. */
  private isJoining = false;

  readonly context = computed(() => this.incomingCallService.preJoinContext());

  readonly isVideoCall = computed(() => {
    return this.context()?.callType === CallType.Video;
  });

  readonly isIncoming = computed(() => {
    return this.context()?.isIncoming === true;
  });

  get visible(): boolean {
    return this.incomingCallService.preJoinVisible();
  }

  set visible(val: boolean) {
    if (!val) {
      this.onClose();
    }
  }

  constructor() {
    // When the modal becomes visible, request camera/mic preview
    effect(() => {
      if (this.incomingCallService.preJoinVisible()) {
        this.startPreview();
      }
    });
  }

  async startPreview(): Promise<void> {
    this.mediaError.set(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: this.isVideoCall()
          ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          : false
      });

      // Mute audio tracks so the user doesn't hear their own mic during preview.
      // The track stays present for the enabled/disabled toggle indicator.
      for (const track of stream.getAudioTracks()) {
        track.enabled = false;
      }

      this.localStream.set(stream);
      this.audioEnabled.set(false);
      this.videoEnabled.set(this.isVideoCall());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      this.mediaError.set(message);
    }
  }

  toggleAudio(): void {
    const stream = this.localStream();
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this.audioEnabled.set(track.enabled);
    }
  }

  toggleVideo(): void {
    const stream = this.localStream();
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this.videoEnabled.set(track.enabled);
    }
  }

  onJoin(): void {
    // Set the joining flag BEFORE calling joinCall() so that the dialog's
    // onHide/visible-setter doesn't call dismiss() and wipe the preJoinContext.
    this.isJoining = true;
    // Persist the user's media toggle choices so the call room can honor them
    this.incomingCallService.setPreJoinMediaState(this.audioEnabled(), this.videoEnabled());
    this.stopPreview();
    this.incomingCallService.joinCall();
  }

  onDecline(): void {
    this.stopPreview();
    this.incomingCallService.declineCall();
  }

  onClose(): void {
    if (this.isJoining) {
      // Don't dismiss — the call room needs the preJoinContext with media state.
      this.isJoining = false;
      return;
    }
    this.stopPreview();
    this.incomingCallService.dismiss();
  }

  private stopPreview(): void {
    const stream = this.localStream();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      this.localStream.set(null);
    }
  }
}
