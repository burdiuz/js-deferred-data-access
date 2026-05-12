import {
  initialize,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import type { PageConfig, WorkerConfig, WorkerInterfaceServer } from './types';

// Page is GUEST: it initiates the handshake by sending identity pings.
// The SW cannot initiate because it does not know which clients will connect.
export const createPageInterface = (config: PageConfig) =>
  initialize({
    ...config,
    type: InterfaceType.GUEST,
    sendMessage: (data: unknown) => {
      const controller = navigator.serviceWorker.controller;
      if (!controller) throw new Error('No active service worker controller.');
      controller.postMessage(data);
    },
    subscribe: (fn: (event: unknown) => void) =>
      navigator.serviceWorker.addEventListener(
        'message',
        fn as EventListenerOrEventListenerObject,
      ),
    unsubscribe: (fn: (event: unknown) => void) =>
      navigator.serviceWorker.removeEventListener(
        'message',
        fn as EventListenerOrEventListenerObject,
      ),
    preprocessResponse: (event: unknown) => (event as MessageEvent).data,
  });

// SW is HOST: waits passively for client pings, creates a per-client DDA
// session on the first message from each client.
//
// DDA's handshake() registers its listener synchronously inside the Promise
// constructor before the first await, so the listener is in `listeners`
// before we re-dispatch the triggering event to it.
export const createWorkerInterface = (
  config: WorkerConfig,
): WorkerInterfaceServer => {
  const sessions = new Map<
    string,
    { listeners: Set<(event: unknown) => void>; dispose: () => void }
  >();

  const globalListener = (event: MessageEvent) => {
    const client = event.source as { id?: string; postMessage: (data: unknown) => void } | null;
    if (!client?.id) return;
    const clientId = client.id;

    let session = sessions.get(clientId);
    if (!session) {
      const listeners = new Set<(event: unknown) => void>();
      session = { listeners, dispose: () => {} };
      sessions.set(clientId, session);

      initialize({
        ...config,
        type: InterfaceType.HOST,
        subscribe: (fn) => listeners.add(fn),
        unsubscribe: (fn) => listeners.delete(fn),
        sendMessage: (data) => client.postMessage(data),
        preprocessResponse: (e) => (e as MessageEvent).data,
      }).then(({ stop, root }) => {
        session!.dispose = stop;
        config.onConnect?.({ clientId, root, stop });
      });

      // Re-dispatch the message that triggered session creation.
      // Since initialize() registered its handshake listener synchronously
      // above, this call lets the HOST process the GUEST's identity ping.
      for (const fn of [...listeners]) {
        fn(event);
      }
    } else {
      for (const fn of [...session.listeners]) {
        fn(event);
      }
    }
  };

  (self as unknown as EventTarget).addEventListener('message', globalListener as EventListener);

  return {
    stop: () => {
      (self as unknown as EventTarget).removeEventListener('message', globalListener as EventListener);
      for (const session of sessions.values()) {
        session.dispose();
      }
      sessions.clear();
    },
  };
};
