import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AuthStore } from '@/core/auth/auth.store';
import { CallType, IncomingCallNotification } from '@/features/call-history/models/call-history.model';

import { CallApiService } from './call-api.service';
import { GeneralHubService } from './general-hub.service';

/**
 * Context object for the pre-join modal.
 * Supports both incoming-call and join-from-history flows.
 */
export interface PreJoinContext {
  callId: string;
  callType: CallType;
  callerName: string;
  /** True when the user is being called (shows Decline). False when user initiated join (shows Cancel). */
  isIncoming: boolean;
  /** Media toggle state from pre-join modal. Null until user confirms join. */
  audioEnabled: boolean | null;
  /** Media toggle state from pre-join modal. Null until user confirms join. */
  videoEnabled: boolean | null;
}

/**
 * Manages incoming call notification state and pre-join modal.
 * Listens to GeneralHub for IncomingCall events and shows a toast + pre-join modal.
 * Also supports opening the pre-join modal for joining a call from call history.
 */
@Injectable({ providedIn: 'root' })
export class IncomingCallService {
  private readonly generalHub = inject(GeneralHubService);
  private readonly callApi = inject(CallApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(AuthStore);

  /** The currently incoming call notification, or null if none. */
  readonly incomingCall = signal<IncomingCallNotification | null>(null);

  /** Pre-join context for the modal (covers both incoming + history join). */
  readonly preJoinContext = signal<PreJoinContext | null>(null);

  /** Whether the pre-join modal is visible. */
  readonly preJoinVisible = signal(false);

  constructor() {
    this.generalHub.incomingCall$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((notification) => {
      this.handleIncomingCall(notification);
    });

    this.generalHub.callEnded$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (this.incomingCall()?.callId === event.callId) {
        this.dismiss();
        this.messageService.add({
          severity: 'info',
          summary: 'Call ended',
          detail: event.reason ?? 'The call has ended.',
          life: 5000
        });
      }
    });

    this.generalHub.callDeclined$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      const currentUserId = this.authStore.user()?.id;
      if (this.incomingCall()?.callId === event.callId && event.userId === currentUserId) {
        this.dismiss();
      }
    });
  }

  private handleIncomingCall(notification: IncomingCallNotification): void {
    this.incomingCall.set(notification);

    this.messageService.add({
      severity: 'secondary',
      summary: 'Incoming call',
      detail: `${notification.initiator.fullName} is calling...`,
      life: 30000,
      key: 'incoming-call',
      data: notification
    });
  }

  /** User clicks "Accept" on the incoming call toast — open the pre-join modal. */
  openPreJoin(): void {
    const call = this.incomingCall();
    if (!call) return;

    this.messageService.clear('incoming-call');
    this.preJoinContext.set({
      callId: call.callId,
      callType: call.callType,
      callerName: call.initiator.fullName,
      isIncoming: true,
      audioEnabled: null,
      videoEnabled: null
    });
    this.preJoinVisible.set(true);
  }

  /**
   * Open the pre-join modal for joining an existing call (e.g. from call history).
   * This is NOT an incoming call — user chose to join voluntarily.
   */
  openPreJoinForExistingCall(callId: string, callType: CallType, callName: string): void {
    this.preJoinContext.set({
      callId,
      callType,
      callerName: callName,
      isIncoming: false,
      audioEnabled: null,
      videoEnabled: null
    });
    this.preJoinVisible.set(true);
  }

  /** Update the pre-join media toggle state (called by PreJoinModal before joining). */
  setPreJoinMediaState(audioEnabled: boolean, videoEnabled: boolean): void {
    const ctx = this.preJoinContext();
    if (ctx) {
      this.preJoinContext.set({ ...ctx, audioEnabled, videoEnabled });
    }
  }

  /** User confirms join from the pre-join modal — navigate to call room. */
  joinCall(): void {
    const ctx = this.preJoinContext();
    if (!ctx) return;
    this.preJoinVisible.set(false);
    // Keep preJoinContext alive so the call room can read media state after navigation.
    // It will be cleared when the call room reads it via consumePreJoinContext().
    this.incomingCall.set(null);
    this.router.navigate(['/call', ctx.callId]);
  }

  /**
   * Consume and clear the pre-join context.
   * Called by the call room after reading the media state.
   */
  consumePreJoinContext(): PreJoinContext | null {
    const ctx = this.preJoinContext();
    this.preJoinContext.set(null);
    return ctx;
  }

  /** User clicks "Decline" — call the decline API and dismiss. */
  declineCall(): void {
    const call = this.incomingCall();
    if (call) {
      this.callApi.declineCall(call.callId).subscribe({
        error: (err) => {
          console.error('Failed to decline call:', err);
        }
      });
    }
    this.dismiss();
  }

  /** Dismiss the notification/modal without declining. */
  dismiss(): void {
    this.messageService.clear('incoming-call');
    this.preJoinVisible.set(false);
    this.preJoinContext.set(null);
    this.incomingCall.set(null);
  }
}
