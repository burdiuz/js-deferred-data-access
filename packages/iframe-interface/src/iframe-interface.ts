import {
  initialize,
  createSubscriberFns,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import { ParentConfig, IframeConfig } from './types';

const createPreprocessResponse =
  (origin: string, userPreprocess?: (data: unknown) => unknown) =>
  (event: unknown): unknown => {
    if (typeof MessageEvent !== 'undefined' && event instanceof MessageEvent) {
      if (origin !== '*' && event.origin !== origin) return null;
      const data = event.data;
      return userPreprocess ? userPreprocess(data) : data;
    }
    return userPreprocess ? userPreprocess(event) : event;
  };

export const initializeParent = ({
  iframe,
  origin = '*',
  preprocessResponse,
  ...params
}: ParentConfig) => {
  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    throw new Error('iframe.contentWindow is not available.');
  }

  return initialize({
    ...params,
    type: InterfaceType.HOST,
    sendMessage: (message: unknown) => contentWindow.postMessage(message, origin),
    preprocessResponse: createPreprocessResponse(origin, preprocessResponse),
    ...createSubscriberFns(window),
  });
};

export const initializeIframe = ({
  origin = '*',
  preprocessResponse,
  ...params
}: IframeConfig) =>
  initialize({
    ...params,
    type: InterfaceType.GUEST,
    sendMessage: (message: unknown) => window.parent.postMessage(message, origin),
    preprocessResponse: createPreprocessResponse(origin, preprocessResponse),
    ...createSubscriberFns(window),
  });
