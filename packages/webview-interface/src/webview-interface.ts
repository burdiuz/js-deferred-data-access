import {
  initialize,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import {
  WebViewHostConfig,
  WebViewGuestConfig,
  WebViewHostHandle,
  WebViewMessageEvent,
} from './types';

type RNGlobal = {
  window?: {
    ReactNativeWebView?: { postMessage: (s: string) => void };
    addEventListener: (type: string, fn: unknown) => void;
    removeEventListener: (type: string, fn: unknown) => void;
  };
};

const safeStringify = (data: unknown): string => JSON.stringify(JSON.stringify(data));

const parseEventData = (raw: unknown): unknown => {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

export const initializeHost = ({
  webView,
  ...params
}: WebViewHostConfig): WebViewHostHandle => {
  const listeners = new Set<(event: unknown) => void>();

  const onMessage = (event: WebViewMessageEvent): void => {
    listeners.forEach((fn) => fn(event));
  };

  const connection = initialize({
    ...params,
    type: InterfaceType.HOST,
    subscribe: (fn) => listeners.add(fn),
    unsubscribe: (fn) => listeners.delete(fn),
    sendMessage: (data) =>
      webView.injectJavaScript(
        `window.dispatchEvent(new MessageEvent('message',{data:${safeStringify(data)}}));true;`,
      ),
    preprocessResponse: (event: unknown) =>
      parseEventData(
        (event as WebViewMessageEvent)?.nativeEvent?.data ??
          (event as { data?: unknown })?.data,
      ),
  });

  return { onMessage, connection };
};

export const initializeGuest = (
  params: WebViewGuestConfig = {},
): ReturnType<typeof initialize> => {
  const g = globalThis as unknown as RNGlobal;
  const win = g.window;
  const rnWebView = win?.ReactNativeWebView;

  if (!rnWebView) {
    throw new Error(
      'ReactNativeWebView is not available. initializeGuest() must run inside a React Native WebView.',
    );
  }

  return initialize({
    ...params,
    type: InterfaceType.GUEST,
    subscribe: (fn) => win!.addEventListener('message', fn),
    unsubscribe: (fn) => win!.removeEventListener('message', fn),
    sendMessage: (data) => rnWebView.postMessage(JSON.stringify(data)),
    preprocessResponse: (event: unknown) =>
      parseEventData((event as { data?: unknown })?.data),
  });
};
