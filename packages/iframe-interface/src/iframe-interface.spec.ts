import { initializeParent, initializeIframe } from './iframe-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

jest.mock('@actualwave/deferred-data-access/interface', () => ({
  initialize: jest.fn().mockResolvedValue({ stop: jest.fn(), root: null }),
  createSubscriberFns: jest.fn().mockReturnValue({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
  InterfaceType: { HOST: 'host', GUEST: 'guest' },
}));

const { initialize, createSubscriberFns } =
  jest.requireMock('@actualwave/deferred-data-access/interface');

const makeIframe = (contentWindow: Window | null = {} as Window) =>
  ({ contentWindow } as HTMLIFrameElement);

beforeEach(() => {
  jest.clearAllMocks();
  // Provide a minimal window.parent
  Object.defineProperty(global, 'window', {
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      parent: { postMessage: jest.fn() },
    },
    configurable: true,
    writable: true,
  });
});

// ---------------------------------------------------------------------------
// initializeParent
// ---------------------------------------------------------------------------

describe('initializeParent', () => {
  it('calls initialize with HOST type', async () => {
    const postMessage = jest.fn();
    const iframe = makeIframe({ postMessage } as any);

    await initializeParent({ iframe });

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.HOST })
    );
  });

  it('throws when contentWindow is null', () => {
    const iframe = makeIframe(null);
    expect(() => initializeParent({ iframe })).toThrow('contentWindow');
  });

  it('sendMessage posts to contentWindow with default origin *', async () => {
    const postMessage = jest.fn();
    const iframe = makeIframe({ postMessage } as any);

    await initializeParent({ iframe });

    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage('msg');
    expect(postMessage).toHaveBeenCalledWith('msg', '*');
  });

  it('sendMessage uses provided origin', async () => {
    const postMessage = jest.fn();
    const iframe = makeIframe({ postMessage } as any);

    await initializeParent({ iframe, origin: 'https://example.com' });

    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage('msg');
    expect(postMessage).toHaveBeenCalledWith('msg', 'https://example.com');
  });

  it('uses createSubscriberFns with window', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe });
    expect(createSubscriberFns).toHaveBeenCalledWith(window);
  });

  it('passes extra params through to initialize', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, id: 'test-id', root: { foo: 1 } });

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-id', root: { foo: 1 } })
    );
  });
});

// ---------------------------------------------------------------------------
// initializeIframe
// ---------------------------------------------------------------------------

describe('initializeIframe', () => {
  it('calls initialize with GUEST type', async () => {
    await initializeIframe({});
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.GUEST })
    );
  });

  it('sendMessage posts to window.parent with default origin *', async () => {
    await initializeIframe({});

    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage('msg');
    expect(window.parent.postMessage).toHaveBeenCalledWith('msg', '*');
  });

  it('sendMessage uses provided origin', async () => {
    await initializeIframe({ origin: 'https://host.com' });

    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage('msg');
    expect(window.parent.postMessage).toHaveBeenCalledWith('msg', 'https://host.com');
  });

  it('uses createSubscriberFns with window', async () => {
    await initializeIframe({});
    expect(createSubscriberFns).toHaveBeenCalledWith(window);
  });
});

// ---------------------------------------------------------------------------
// preprocessResponse — origin filtering
// ---------------------------------------------------------------------------

describe('preprocessResponse (origin filtering)', () => {
  const makeMessageEvent = (origin: string, data: unknown) => {
    const event = Object.create(MessageEvent.prototype);
    Object.defineProperty(event, 'origin', { value: origin });
    Object.defineProperty(event, 'data', { value: data });
    return event;
  };

  it('passes message through when origin is *', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, origin: '*' });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = makeMessageEvent('https://any.com', { id: 'x' });
    expect(preprocessResponse(event)).toEqual({ id: 'x' });
  });

  it('returns null for wrong origin', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, origin: 'https://allowed.com' });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = makeMessageEvent('https://evil.com', { id: 'x' });
    expect(preprocessResponse(event)).toBeNull();
  });

  it('passes message through for correct origin', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, origin: 'https://allowed.com' });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = makeMessageEvent('https://allowed.com', { id: 'x' });
    expect(preprocessResponse(event)).toEqual({ id: 'x' });
  });

  it('passes non-MessageEvent data through unchanged', async () => {
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const plain = { id: 'y', type: 'request' };
    expect(preprocessResponse(plain)).toBe(plain);
  });

  it('chains user-supplied preprocessResponse after origin check', async () => {
    const userPreprocess = jest.fn((d) => ({ ...d, extra: true }));
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, origin: '*', preprocessResponse: userPreprocess });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = makeMessageEvent('https://any.com', { id: 'z' });
    const result = preprocessResponse(event);
    expect(userPreprocess).toHaveBeenCalledWith({ id: 'z' });
    expect(result).toEqual({ id: 'z', extra: true });
  });

  it('does not call user preprocessResponse when origin blocked', async () => {
    const userPreprocess = jest.fn();
    const iframe = makeIframe({ postMessage: jest.fn() } as any);
    await initializeParent({ iframe, origin: 'https://allowed.com', preprocessResponse: userPreprocess });

    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = makeMessageEvent('https://evil.com', {});
    preprocessResponse(event);
    expect(userPreprocess).not.toHaveBeenCalled();
  });
});
