import { Injectable, OnDestroy, signal } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';

import { environment } from '../../../environments/environment';

export interface PeerStream {
  peerId: string;
  userId: string;
  stream: MediaStream;
}

/**
 * Manages PeerJS peer connections and WebRTC media streams.
 * Each user creates one Peer instance per call session.
 * Uses a mesh topology: every participant connects to every other participant.
 */
@Injectable({ providedIn: 'root' })
export class PeerService implements OnDestroy {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private readonly connections = new Map<string, MediaConnection>();

  /**
   * Maps PeerJS peerId → application userId.
   * Populated by the call room when PeerIdRegistered events arrive.
   * Used by the incoming call handler to resolve the userId for incoming PeerJS calls.
   */
  private readonly knownPeerUsers = new Map<string, string>();

  readonly peerId = signal<string | null>(null);
  readonly remoteStreams = signal<PeerStream[]>([]);
  readonly localStreamSignal = signal<MediaStream | null>(null);
  readonly isConnecting = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Initialize PeerJS and get local media stream.
   * @param video Whether to request video (true) or audio-only (false)
   */
  async initialize(video: boolean): Promise<string> {
    this.isConnecting.set(true);
    this.error.set(null);

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
          : false
      });
      this.localStreamSignal.set(this.localStream);

      return new Promise<string>((resolve, reject) => {
        this.peer = new Peer({
          host: environment.peerJs.host,
          port: environment.peerJs.port,
          path: environment.peerJs.path,
          secure: environment.peerJs.secure,
          config: {
            iceServers: environment.iceServers
          }
        });

        this.peer.on('open', (id) => {
          this.peerId.set(id);
          this.isConnecting.set(false);
          this.setupIncomingCallHandler();
          resolve(id);
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS error:', err);
          this.error.set(err.message ?? 'PeerJS connection failed');
          this.isConnecting.set(false);
          reject(err);
        });

        this.peer.on('disconnected', () => {
          console.warn('PeerJS disconnected, attempting reconnect...');
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
        });
      });
    } catch (err) {
      this.isConnecting.set(false);
      const message = err instanceof Error ? err.message : 'Failed to access media devices';
      this.error.set(message);
      throw err;
    }
  }

  /**
   * Register a known mapping from PeerJS peerId to application userId.
   * This allows the incoming call handler to resolve the userId when
   * a PeerJS call arrives (PeerJS doesn't carry custom metadata).
   */
  registerPeerUser(peerId: string, userId: string): void {
    this.knownPeerUsers.set(peerId, userId);
  }

  /**
   * Call a remote peer by their PeerJS ID.
   */
  callPeer(remotePeerId: string, userId: string): void {
    if (!this.peer || !this.localStream) {
      console.error('Cannot call: peer or local stream not ready');
      return;
    }

    if (this.connections.has(remotePeerId)) {
      return;
    }

    const call = this.peer.call(remotePeerId, this.localStream);
    this.handleMediaConnection(call, userId);
  }

  /**
   * Stop all media tracks and close all connections.
   */
  destroy(): void {
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
      this.localStreamSignal.set(null);
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.peerId.set(null);
    this.remoteStreams.set([]);
    this.error.set(null);
    this.knownPeerUsers.clear();
  }

  /**
   * Remove a specific peer's stream (when they leave).
   */
  removePeer(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
    }
    this.remoteStreams.update((streams) => streams.filter((s) => s.peerId !== peerId));
  }

  /**
   * Update the userId associated with a remote peer.
   * Called when we learn the mapping from CallHub (PeerIdRegistered event)
   * after an incoming PeerJS call was already answered with userId 'unknown'.
   */
  updatePeerUserId(peerId: string, userId: string): void {
    this.remoteStreams.update((streams) =>
      streams.map((s) => (s.peerId === peerId ? { ...s, userId } : s))
    );
  }

  /**
   * Toggle local audio track.
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle local video track on/off via track.enabled.
   * This is the standard WebRTC approach — it keeps the hardware capture
   * session alive but stops/resumes sending frames. Using track.enabled
   * (rather than stop+re-acquire) ensures the remote RTCRtpReceiver
   * seamlessly pauses/resumes without needing sender renegotiation.
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Get current audio enabled state.
   */
  get isAudioEnabled(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    return track?.enabled ?? false;
  }

  /**
   * Get current video enabled state.
   */
  get isVideoEnabled(): boolean {
    const track = this.localStream?.getVideoTracks()[0];
    return track?.enabled ?? false;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private setupIncomingCallHandler(): void {
    if (!this.peer) return;

    this.peer.on('call', (call) => {
      if (!this.localStream) {
        console.error('Received call but no local stream available');
        return;
      }
      call.answer(this.localStream);
      // Resolve userId from known peerId→userId map; falls back to 'unknown'
      const userId = this.knownPeerUsers.get(call.peer) ?? 'unknown';
      this.handleMediaConnection(call, userId);
    });
  }

  private handleMediaConnection(call: MediaConnection, userId: string): void {
    this.connections.set(call.peer, call);

    call.on('stream', (remoteStream) => {
      const existing = this.remoteStreams().find((s) => s.peerId === call.peer);
      if (!existing) {
        this.remoteStreams.update((streams) => [
          ...streams,
          { peerId: call.peer, userId, stream: remoteStream }
        ]);
      }
    });

    call.on('close', () => {
      this.connections.delete(call.peer);
      this.remoteStreams.update((streams) => streams.filter((s) => s.peerId !== call.peer));
    });

    call.on('error', (err) => {
      console.error(`Media connection error with ${call.peer}:`, err);
      this.connections.delete(call.peer);
      this.remoteStreams.update((streams) => streams.filter((s) => s.peerId !== call.peer));
    });
  }
}
