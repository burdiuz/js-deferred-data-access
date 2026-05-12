import { BaseInitConfig } from '@actualwave/deferred-data-access/interface';

// Two distinct event names on the same element avoid echo: the MFE only
// listens for the host event and the shell only listens for the guest event,
// so a dispatched message is never received by its own sender.
export const HOST_EVENT = 'dda:host-message';
export const GUEST_EVENT = 'dda:guest-message';

type WithoutTransport = Omit<
  BaseInitConfig,
  'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse'
>;

// element is the MFE's root DOM node — it acts as the message bus endpoint.
// Both sides target the same element; direction is determined by event name.
export type MFEInterfaceConfig = WithoutTransport & {
  element: HTMLElement;
  hostEventName?: string;
  guestEventName?: string;
};

export interface Connection {
  root: unknown;
  stop: () => void;
}
