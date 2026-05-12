import {
  initialize,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import { HOST_EVENT, GUEST_EVENT, MFEInterfaceConfig, Connection } from './types';

// Builds the three transport hooks required by `initialize()` for a given
// element and pair of event names.
//
// Protocol layers:
//   Layer 1 — CustomEvent on `element` (transport)
//   Layer 2 — DDA protocol message in `event.detail` (data)
//
// `bubbles: false` keeps events local to the element; they must not propagate
// up the DOM tree where other MFEs or the shell might catch them.
const createTransport = (
  element: HTMLElement,
  sendEventName: string,
  receiveEventName: string,
) => ({
  sendMessage: (message: unknown): void => {
    element.dispatchEvent(
      new CustomEvent(sendEventName, { detail: message, bubbles: false }),
    );
  },
  subscribe: (fn: EventListener): void => {
    element.addEventListener(receiveEventName, fn);
  },
  unsubscribe: (fn: EventListener): void => {
    element.removeEventListener(receiveEventName, fn);
  },
  // Unwrap the DDA message from the CustomEvent envelope before handing it
  // to the DDA interface. Non-CustomEvent values pass through unchanged so
  // the transport works in test environments that inject plain objects.
  preprocessResponse: (event: unknown): unknown =>
    event instanceof CustomEvent ? event.detail : event,
});

// Called inside the microfrontend. Sends on the guest event, listens on the
// host event — the inverse of the shell side.
export const initializeMFEInterface = ({
  element,
  hostEventName = HOST_EVENT,
  guestEventName = GUEST_EVENT,
  ...params
}: MFEInterfaceConfig): Promise<Connection> =>
  initialize({
    ...params,
    type: InterfaceType.GUEST,
    ...createTransport(element, guestEventName, hostEventName),
  }) as Promise<Connection>;

// Called by the shell / orchestrator. Sends on the host event, listens on the
// guest event — the inverse of the MFE side.
export const connectMFEInterface = ({
  element,
  hostEventName = HOST_EVENT,
  guestEventName = GUEST_EVENT,
  ...params
}: MFEInterfaceConfig): Promise<Connection> =>
  initialize({
    ...params,
    type: InterfaceType.HOST,
    ...createTransport(element, hostEventName, guestEventName),
  }) as Promise<Connection>;
