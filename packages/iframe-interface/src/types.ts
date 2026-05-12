import { BaseInitConfig } from '@actualwave/deferred-data-access/interface';

type WithoutTransport = Omit<BaseInitConfig, 'subscribe' | 'unsubscribe' | 'sendMessage'>;

export type ParentConfig = WithoutTransport & {
  iframe: HTMLIFrameElement;
  origin?: string;
};

export type IframeConfig = WithoutTransport & {
  origin?: string;
};
