import {
  initialize,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import type { BaseInitConfig } from '@actualwave/deferred-data-access/interface';

export type BroadcastInterfaceOptions = Omit<
  BaseInitConfig,
  'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse'
> & {
  channelName: string;
  type: InterfaceType;
};

// Opens a BroadcastChannel, wires it to DDA's transport interface, and closes
// it when the returned stop() is called.
//
// BroadcastChannel broadcasts to all subscribers on the same channel name.
// The DDA message envelope's source/target fields filter out messages not
// addressed to this endpoint, so no extra routing logic is required.
export const createBroadcastInterface = async ({
  channelName,
  ...config
}: BroadcastInterfaceOptions) => {
  const channel = new BroadcastChannel(channelName);

  const result = await initialize({
    ...config,
    sendMessage: (data: unknown) => channel.postMessage(data),
    subscribe: (fn: (event: unknown) => void) =>
      channel.addEventListener('message', fn as EventListenerOrEventListenerObject),
    unsubscribe: (fn: (event: unknown) => void) =>
      channel.removeEventListener('message', fn as EventListenerOrEventListenerObject),
    preprocessResponse: (event: unknown) => (event as MessageEvent).data,
  });

  const { stop } = result;
  return {
    ...result,
    stop: () => {
      stop();
      channel.close();
    },
  };
};
