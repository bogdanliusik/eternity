import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { MessageService } from 'primeng/api';
import { SessionsService } from '../services/sessions.service';
import { Session, SessionStatus } from '../models/session.model';
import { Activity, Archive, Wifi } from 'lucide-angular';
import { TabbedListConfig, TabDefinition } from '@/shared/components/tabbed-list/tabbed-list.models';
import { TABBED_LIST_CONFIG, TabbedListStore } from '@/shared/components/tabbed-list/tabbed-list.store';
import { computed } from '@angular/core';

export const SESSION_TABS: TabDefinition[] = [
  {
    id: SessionStatus.Online,
    label: 'Online',
    icon: Wifi,
    badgeSeverity: 'success',
    emptyState: {
      title: 'No users online',
      description: 'No users currently have an active WebSocket connection.'
    }
  },
  {
    id: SessionStatus.Active,
    label: 'Active',
    icon: Activity,
    badgeSeverity: 'warn',
    emptyState: {
      title: 'No active sessions',
      description: 'Everyone is signed out or sessions have expired.'
    }
  },
  {
    id: SessionStatus.Inactive,
    label: 'Inactive',
    icon: Archive,
    badgeSeverity: 'info',
    emptyState: {
      title: 'No inactive sessions yet',
      description: 'Ended sessions will appear here for auditing.'
    }
  }
];

function sessionsConfigFactory(): TabbedListConfig {
  const service = inject(SessionsService);
  return {
    tabs: SESSION_TABS,
    defaultTab: SessionStatus.Online,
    pageSize: 30,
    itemId: (item: any) => item.id,
    loadFn: (tabId, page, pageSize) => {
      switch (tabId) {
        case SessionStatus.Online:
          return service.getOnlineSessions(page, pageSize);
        case SessionStatus.Active:
          return service.getSessions(true, page, pageSize);
        default:
          return service.getSessions(false, page, pageSize);
      }
    }
  };
}

interface PingDialogState {
  pingVisible: boolean;
  pingSessionId: string;
  pingMessage: string;
  isPinging: boolean;
}

export const SessionsStore = signalStore(
  withState<PingDialogState>({
    pingVisible: false,
    pingSessionId: '',
    pingMessage: '',
    isPinging: false
  }),
  withComputed(() => {
    const listStore = inject(TabbedListStore);
    return {
      hasCurrentSession: computed(() => {
        const online = listStore.tabItems()(SessionStatus.Online) as Session[];
        const active = listStore.tabItems()(SessionStatus.Active) as Session[];
        return online.some((s) => s.isCurrentSession) || active.some((s) => s.isCurrentSession);
      })
    };
  }),
  withMethods((store) => {
    const listStore = inject(TabbedListStore);
    const service = inject(SessionsService);
    const messageService = inject(MessageService);
    return {
      terminate(session: Session) {
        listStore.addProcessingId(session.id);
        service.terminateSession(session.id).subscribe({
          next: () => {
            listStore.removeItem(session.id, {
              fromTabs: [SessionStatus.Online, SessionStatus.Active],
              countAdjustments: { [SessionStatus.Inactive]: 1 }
            });
            listStore.removeProcessingId(session.id);
          },
          error: () => {
            listStore.removeProcessingId(session.id);
          }
        });
      },
      openPingDialog(session: Session) {
        patchState(store, {
          pingSessionId: session.id,
          pingMessage: '',
          pingVisible: true
        });
      },
      closePingDialog() {
        patchState(store, { pingVisible: false });
      },
      updatePingMessage(message: string) {
        patchState(store, { pingMessage: message });
      },
      sendPing() {
        const sessionId = store.pingSessionId();
        const message = store.pingMessage();
        if (!message.trim()) return;
        patchState(store, { isPinging: true });
        service.pingSession({ sessionId, message }).subscribe({
          next: (delivered) => {
            patchState(store, { isPinging: false, pingVisible: false });
            messageService.add({
              severity: delivered ? 'success' : 'warn',
              summary: delivered ? 'Sent' : 'Not delivered',
              detail: delivered ? 'Message delivered to session' : 'Session is not online — message was not delivered',
              life: 4000
            });
          },
          error: () => {
            patchState(store, { isPinging: false });
          }
        });
      }
    };
  })
);

export const sessionsProviders = [
  TabbedListStore,
  SessionsStore,
  { provide: TABBED_LIST_CONFIG, useFactory: sessionsConfigFactory }
];
