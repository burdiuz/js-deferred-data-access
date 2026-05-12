import {
  initialize,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import type { BaseInitConfig } from '@actualwave/deferred-data-access/interface';

type TransportKeys = 'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse';

export type DataChannelInterfaceOptions = Omit<BaseInitConfig, TransportKeys> & {
  channel: RTCDataChannel;
  type: InterfaceType;
};

// Wraps an already-open RTCDataChannel in a DDA interface.
//
// JSON is used for serialization (same as websocket-interface). The channel
// must be in 'open' state; use waitForOpen() if it may still be connecting.
//
// The 'close' event on the channel automatically calls stop() so pending
// requests are cleaned up when the peer disconnects.
export const createDataChannelInterface = async ({
  channel,
  ...config
}: DataChannelInterfaceOptions) => {
  const result = await initialize({
    ...config,
    sendMessage: (data: unknown) => channel.send(JSON.stringify(data)),
    subscribe: (fn: (event: unknown) => void) =>
      channel.addEventListener('message', fn as EventListenerOrEventListenerObject),
    unsubscribe: (fn: (event: unknown) => void) =>
      channel.removeEventListener('message', fn as EventListenerOrEventListenerObject),
    preprocessResponse: (event: unknown) =>
      JSON.parse((event as MessageEvent<string>).data),
  });

  const { stop } = result;

  // Auto-stop when the remote peer closes the channel.
  const onClose = () => stop();
  channel.addEventListener('close', onClose);

  return {
    ...result,
    stop: () => {
      channel.removeEventListener('close', onClose);
      stop();
    },
  };
};

// Resolves when the channel reaches 'open' state, rejects on close/error or timeout.
// Pass a timeout (ms) to bound the wait; omit for no timeout.
export const waitForOpen = (
  channel: RTCDataChannel,
  timeout?: number,
): Promise<RTCDataChannel> => {
  switch (channel.readyState) {
    case 'open':
      return Promise.resolve(channel);

    case 'connecting': {
      return new Promise((resolve, reject) => {
        let timerId: ReturnType<typeof setTimeout> | undefined;

        const cleanup = () => {
          channel.removeEventListener('open', openHandler);
          channel.removeEventListener('close', failHandler);
          channel.removeEventListener('error', failHandler);
          if (timerId !== undefined) clearTimeout(timerId);
        };

        const openHandler = () => { cleanup(); resolve(channel); };
        const failHandler = (e: Event) => { cleanup(); reject(e); };

        channel.addEventListener('open', openHandler);
        channel.addEventListener('close', failHandler);
        channel.addEventListener('error', failHandler);

        if (timeout !== undefined && timeout > 0) {
          timerId = setTimeout(() => {
            cleanup();
            reject(new Error(`RTCDataChannel did not open within ${timeout}ms.`));
          }, timeout);
        }
      });
    }

    case 'closing':
      return Promise.reject(new Error('RTCDataChannel: The channel is closing.'));

    case 'closed':
      return Promise.reject(new Error('RTCDataChannel: The channel is closed.'));

    default:
      return Promise.reject(
        new Error(`RTCDataChannel: Unknown readyState "${channel.readyState}".`),
      );
  }
};
