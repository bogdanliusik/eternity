import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

interface ManagedHub {
  connection: signalR.HubConnection;
  subjects: Map<string, Subject<unknown>>;
}

/**
 * Core SignalR connection manager.
 * Manages multiple hub connections with Observable-based event subscriptions.
 * Hub-specific services should use this to register events and connect/disconnect.
 */
@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private readonly hubs = new Map<string, ManagedHub>();
  private readonly maxReconnectAttempts = 10;

  /**
   * Subscribe to an event on a specific hub.
   * Lazily creates the HubConnection if it doesn't exist yet.
   * Handlers registered via on() persist across reconnections.
   */
  on<T>(hubUrl: string, eventName: string): Observable<T> {
    const hub = this.ensureHub(hubUrl);
    const key = `${hubUrl}::${eventName}`;

    if (!hub.subjects.has(key)) {
      const subject = new Subject<T>();
      hub.subjects.set(key, subject as Subject<unknown>);
      hub.connection.on(eventName, (data: T) => subject.next(data));
    }

    return hub.subjects.get(key)!.asObservable() as Observable<T>;
  }

  /**
   * Invoke a hub method on a specific hub.
   */
  async invoke<T = void>(hubUrl: string, method: string, ...args: unknown[]): Promise<T> {
    const hub = this.hubs.get(hubUrl);
    if (!hub || hub.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Hub ${hubUrl} is not connected`);
    }
    return hub.connection.invoke<T>(method, ...args);
  }

  /**
   * Start the connection for a specific hub.
   */
  async connect(hubUrl: string): Promise<void> {
    const hub = this.ensureHub(hubUrl);
    const state = hub.connection.state;
    if (
      state === signalR.HubConnectionState.Connected ||
      state === signalR.HubConnectionState.Connecting ||
      state === signalR.HubConnectionState.Reconnecting
    ) {
      return;
    }
    try {
      await hub.connection.start();
    } catch (error) {
      console.error(`SignalR connection failed for ${hubUrl}:`, error);
    }
  }

  /**
   * Stop the connection for a specific hub.
   */
  async disconnect(hubUrl: string): Promise<void> {
    const hub = this.hubs.get(hubUrl);
    if (!hub) return;
    try {
      await hub.connection.stop();
    } catch (error) {
      console.error(`SignalR disconnect error for ${hubUrl}:`, error);
    }
  }

  /**
   * Connect all registered hubs.
   */
  async connectAll(): Promise<void> {
    const promises = Array.from(this.hubs.keys()).map((url) => this.connect(url));
    await Promise.allSettled(promises);
  }

  /**
   * Disconnect all registered hubs.
   */
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.hubs.keys()).map((url) => this.disconnect(url));
    await Promise.allSettled(promises);
  }

  /**
   * Check if a specific hub is currently connected.
   */
  isConnected(hubUrl: string): boolean {
    const hub = this.hubs.get(hubUrl);
    return hub?.connection.state === signalR.HubConnectionState.Connected;
  }

  ngOnDestroy(): void {
    this.disconnectAll();
    for (const hub of this.hubs.values()) {
      for (const subject of hub.subjects.values()) {
        subject.complete();
      }
    }
    this.hubs.clear();
  }

  private ensureHub(hubUrl: string): ManagedHub {
    if (!this.hubs.has(hubUrl)) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, { withCredentials: true })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null;
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .build();
      this.setupLifecycleLogging(connection, hubUrl);
      const hub: ManagedHub = { connection, subjects: new Map() };
      this.hubs.set(hubUrl, hub);
    }
    return this.hubs.get(hubUrl)!;
  }

  private setupLifecycleLogging(connection: signalR.HubConnection, hubUrl: string): void {
    connection.onreconnecting(() => {
      console.warn(`SignalR reconnecting: ${hubUrl}`);
    });
    connection.onreconnected(() => {
      console.info(`SignalR reconnected: ${hubUrl}`);
    });
    connection.onclose(() => {
      console.warn(`SignalR connection closed: ${hubUrl}`);
    });
  }
}
