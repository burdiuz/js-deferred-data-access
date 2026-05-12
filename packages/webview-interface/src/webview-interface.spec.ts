import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';
import { initializeHost, initializeGuest } from './webview-interface';

jest.mock('@actualwave/deferred-data-access/interface', () => ({
  InterfaceType: { HOST: 'host', GUEST: 'guest' },
  initialize: jest.fn(),
}));

const initialize = (
  jest.requireMock('@actualwave/deferred-data-access/interface') as Record<string, unknown>
).initialize as {
  mock: { calls: unknown[][] };
  mockResolvedValue: (v: unknown) => void;
  mockClear: () => void;
};

type InitArgs = {
  type: string;
  subscribe: (fn: (e: unknown) => void) => void;
  unsubscribe: (fn: (e: unknown) => void) => void;
  sendMessage: (data: unknown) => void;
  preprocessResponse: (e: unknown) => unknown;
};

const getInitArgs = (callIndex = 0): InitArgs =>
  initialize.mock.calls[callIndex][0] as InitArgs;

describe('initializeHost', () => {
  const webView = { injectJavaScript: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    initialize.mockResolvedValue({ root: {}, stop: jest.fn(), pool: {} });
  });

  it('returns onMessage and connection synchronously', () => {
    const handle = initializeHost({ webView, root: {} });
    expect(typeof handle.onMessage).toBe('function');
    expect(typeof (handle.connection as Promise<unknown>).then).toBe('function');
  });

  it('calls initialize with HOST type', () => {
    initializeHost({ webView, root: {} });
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.HOST }),
    );
  });

  it('sendMessage injects serialised JavaScript', () => {
    initializeHost({ webView, root: {} });
    getInitArgs().sendMessage({ cmd: 'ping' });
    expect(webView.injectJavaScript).toHaveBeenCalledWith(
      expect.stringContaining('window.dispatchEvent'),
    );
  });

  it('onMessage dispatches to subscribed listeners', () => {
    const handle = initializeHost({ webView, root: {} });
    const listener = jest.fn();
    getInitArgs().subscribe(listener);
    const event = { nativeEvent: { data: '{}' } };
    handle.onMessage(event);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('preprocessResponse extracts nativeEvent.data and parses JSON', () => {
    initializeHost({ webView, root: {} });
    const result = getInitArgs().preprocessResponse({ nativeEvent: { data: '{"key":"value"}' } });
    expect(result).toEqual({ key: 'value' });
  });

  it('preprocessResponse falls back to MessageEvent.data', () => {
    initializeHost({ webView, root: {} });
    const result = getInitArgs().preprocessResponse({ data: '{"x":1}' });
    expect(result).toEqual({ x: 1 });
  });

  it('unsubscribe removes the listener', () => {
    const handle = initializeHost({ webView, root: {} });
    const listener = jest.fn();
    getInitArgs().subscribe(listener);
    getInitArgs().unsubscribe(listener);
    handle.onMessage({ nativeEvent: { data: '{}' } });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('initializeGuest', () => {
  const rnWebView = { postMessage: jest.fn() };
  const mockWindow = {
    ReactNativeWebView: rnWebView,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    initialize.mockResolvedValue({ root: {}, stop: jest.fn(), pool: {} });
    (globalThis as unknown as Record<string, unknown>).window = mockWindow;
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).window;
  });

  it('calls initialize with GUEST type', () => {
    initializeGuest();
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.GUEST }),
    );
  });

  it('sendMessage calls ReactNativeWebView.postMessage with JSON string', () => {
    initializeGuest();
    getInitArgs().sendMessage({ cmd: 'hello' });
    expect(rnWebView.postMessage).toHaveBeenCalledWith(JSON.stringify({ cmd: 'hello' }));
  });

  it('subscribe calls window.addEventListener', () => {
    initializeGuest();
    const fn = jest.fn();
    getInitArgs().subscribe(fn);
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('message', fn);
  });

  it('unsubscribe calls window.removeEventListener', () => {
    initializeGuest();
    const fn = jest.fn();
    getInitArgs().unsubscribe(fn);
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('message', fn);
  });

  it('preprocessResponse parses JSON from event.data', () => {
    initializeGuest();
    const result = getInitArgs().preprocessResponse({ data: '{"answer":42}' });
    expect(result).toEqual({ answer: 42 });
  });

  it('throws when ReactNativeWebView is not available', () => {
    (globalThis as unknown as Record<string, unknown>).window = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    expect(() => initializeGuest()).toThrow('ReactNativeWebView is not available');
  });
});
