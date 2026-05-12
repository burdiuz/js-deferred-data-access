import { BaseInitConfig, initialize } from '@actualwave/deferred-data-access/interface';

export type WebViewRef = {
  injectJavaScript: (script: string) => void;
};

export type WebViewMessageEvent = {
  nativeEvent: { data: string };
};

export type WebViewHostConfig = Omit<
  BaseInitConfig,
  'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse'
> & {
  webView: WebViewRef;
};

export type WebViewGuestConfig = Omit<
  BaseInitConfig,
  'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse'
>;

export type WebViewHostHandle = {
  onMessage: (event: WebViewMessageEvent) => void;
  connection: ReturnType<typeof initialize>;
};
