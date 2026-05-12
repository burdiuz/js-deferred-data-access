import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';
import { createPageInterface, createWorkerInterface } from './serviceworker-interface';

jest.mock('@actualwave/deferred-data-access/interface');

const mockInitialize = initialize as jest.MockedFunction<typeof initialize>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeStopResult = (root: unknown = null) =>
  Promise.resolve({ stop: jest.fn(), pool: {} as any, root } as any);

// Simulates DDA registering its listener synchronously (mirrors real behaviour:
// handshake() calls subscribe() inside the Promise constructor before awaiting).
const syncSubscribeMock = (root: unknown = null) =>
  mockInitialize.mockImplementation(({ subscribe }: any) => {
    subscribe(jest.fn());
    return makeStopResult(root);
  });

// ---------------------------------------------------------------------------
// createPageInterface
// ---------------------------------------------------------------------------

describe('createPageInterface', () => {
  let mockController: { postMessage: jest.Mock };
  let mockSwReg: {
    controller: { postMessage: jest.Mock } | null;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = { postMessage: jest.fn() };
    mockSwReg = {
      controller: mockController,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    Object.defineProperty(globalThis, 'navigator', {
      value: { serviceWorker: mockSwReg },
      configurable: true,
      writable: true,
    });
    mockInitialize.mockResolvedValue({ stop: jest.fn(), pool: {} as any, root: null });
  });

  it('calls initialize with GUEST type', async () => {
    await createPageInterface({});
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.GUEST }),
    );
  });

  it('subscribe attaches to navigator.serviceWorker', async () => {
    await createPageInterface({});
    const { subscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    subscribe(fn);
    expect(mockSwReg.addEventListener).toHaveBeenCalledWith('message', fn);
  });

  it('unsubscribe removes from navigator.serviceWorker', async () => {
    await createPageInterface({});
    const { unsubscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    unsubscribe(fn);
    expect(mockSwReg.removeEventListener).toHaveBeenCalledWith('message', fn);
  });

  it('sendMessage calls controller.postMessage', async () => {
    await createPageInterface({});
    const { sendMessage } = (mockInitialize.mock.calls[0] as any)[0];
    sendMessage({ cmd: 'ping' });
    expect(mockController.postMessage).toHaveBeenCalledWith({ cmd: 'ping' });
  });

  it('sendMessage throws when controller is null', async () => {
    mockSwReg.controller = null;
    await createPageInterface({});
    const { sendMessage } = (mockInitialize.mock.calls[0] as any)[0];
    expect(() => sendMessage({})).toThrow('No active service worker controller.');
  });

  it('preprocessResponse extracts event.data', async () => {
    await createPageInterface({});
    const { preprocessResponse } = (mockInitialize.mock.calls[0] as any)[0];
    expect(preprocessResponse!({ data: 'payload' })).toBe('payload');
  });

  it('passes through config options', async () => {
    await createPageInterface({ id: 'page-1', handshakeTimeout: 3000 });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'page-1', handshakeTimeout: 3000 }),
    );
  });
});

// ---------------------------------------------------------------------------
// createWorkerInterface
// ---------------------------------------------------------------------------

describe('createWorkerInterface', () => {
  let selfListeners: Map<string, Set<Function>>;
  let mockSelf: { addEventListener: jest.Mock; removeEventListener: jest.Mock };

  const makeClient = (id: string) => ({ id, postMessage: jest.fn() });

  const dispatchToSelf = (event: MessageEvent) => {
    for (const fn of selfListeners.get('message') ?? []) {
      (fn as Function)(event);
    }
  };

  const makeEvent = (clientId: string, data: unknown = {}) => {
    const client = makeClient(clientId);
    return { event: { data, source: client } as unknown as MessageEvent, client };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    selfListeners = new Map();
    mockSelf = {
      addEventListener: jest.fn((type: string, fn: Function) => {
        if (!selfListeners.has(type)) selfListeners.set(type, new Set());
        selfListeners.get(type)!.add(fn);
      }),
      removeEventListener: jest.fn((type: string, fn: Function) => {
        selfListeners.get(type)?.delete(fn);
      }),
    };
    Object.defineProperty(globalThis, 'self', {
      value: mockSelf,
      configurable: true,
      writable: true,
    });
    syncSubscribeMock();
  });

  it('registers a global message listener on self', () => {
    createWorkerInterface({});
    expect(selfListeners.get('message')?.size).toBe(1);
  });

  it('creates a new DDA session on the first message from a client', () => {
    createWorkerInterface({});
    const { event } = makeEvent('client-1');
    dispatchToSelf(event);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it('does not create a second session for subsequent messages from the same client', () => {
    createWorkerInterface({});
    const { event } = makeEvent('client-1');
    dispatchToSelf(event);
    dispatchToSelf(event);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it('creates separate sessions for different clients', () => {
    createWorkerInterface({});
    dispatchToSelf(makeEvent('client-1').event);
    dispatchToSelf(makeEvent('client-2').event);
    expect(mockInitialize).toHaveBeenCalledTimes(2);
  });

  it('calls initialize with HOST type', () => {
    createWorkerInterface({});
    dispatchToSelf(makeEvent('client-1').event);
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.HOST }),
    );
  });

  it('sendMessage targets the source client', () => {
    createWorkerInterface({});
    const { event, client } = makeEvent('client-1', { id: 'x' });
    dispatchToSelf(event);
    const { sendMessage } = (mockInitialize.mock.calls[0] as any)[0];
    sendMessage({ resp: 1 });
    expect(client.postMessage).toHaveBeenCalledWith({ resp: 1 });
  });

  it('preprocessResponse extracts event.data', () => {
    createWorkerInterface({});
    dispatchToSelf(makeEvent('client-1').event);
    const { preprocessResponse } = (mockInitialize.mock.calls[0] as any)[0];
    expect(preprocessResponse!({ data: 'hello' })).toBe('hello');
  });

  it('re-dispatches the triggering event to the new session listeners', () => {
    const captured: unknown[] = [];
    mockInitialize.mockImplementation(({ subscribe }: any) => {
      subscribe((e: unknown) => captured.push(e));
      return makeStopResult();
    });
    createWorkerInterface({});
    const { event } = makeEvent('client-1', { id: 'x' });
    dispatchToSelf(event);
    expect(captured).toContain(event);
  });

  it('routes subsequent messages to the session listeners', () => {
    const received: unknown[] = [];
    let callCount = 0;
    mockInitialize.mockImplementation(({ subscribe }: any) => {
      subscribe((e: unknown) => {
        // only record calls after the first (re-dispatched) one
        if (callCount++ > 0) received.push(e);
      });
      return makeStopResult();
    });
    createWorkerInterface({});
    const { event } = makeEvent('client-1');
    const event2 = { data: 'second', source: (event as any).source } as unknown as MessageEvent;
    dispatchToSelf(event);
    dispatchToSelf(event2);
    expect(received).toContain(event2);
  });

  it('ignores messages with no source', () => {
    createWorkerInterface({});
    dispatchToSelf({ data: {}, source: null } as unknown as MessageEvent);
    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('ignores messages from sources without an id', () => {
    createWorkerInterface({});
    dispatchToSelf({ data: {}, source: { postMessage: jest.fn() } } as unknown as MessageEvent);
    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('calls onConnect after handshake with clientId and root', async () => {
    const onConnect = jest.fn();
    const stopFn = jest.fn();
    mockInitialize.mockImplementation(({ subscribe }: any) => {
      subscribe(jest.fn());
      return Promise.resolve({ stop: stopFn, pool: {} as any, root: 'remoteRoot' } as any);
    });
    createWorkerInterface({ onConnect });
    dispatchToSelf(makeEvent('client-1').event);
    await Promise.resolve();
    expect(onConnect).toHaveBeenCalledWith({
      clientId: 'client-1',
      root: 'remoteRoot',
      stop: stopFn,
    });
  });

  it('stop() removes the global listener', () => {
    const { stop } = createWorkerInterface({});
    stop();
    expect(selfListeners.get('message')?.size).toBe(0);
  });

  it('stop() calls dispose on all active sessions', async () => {
    const stopFn = jest.fn();
    mockInitialize.mockImplementation(({ subscribe }: any) => {
      subscribe(jest.fn());
      return Promise.resolve({ stop: stopFn, pool: {} as any, root: null });
    });
    const server = createWorkerInterface({});
    dispatchToSelf(makeEvent('client-1').event);
    await Promise.resolve();
    server.stop();
    expect(stopFn).toHaveBeenCalled();
  });

  it('passes through config options to initialize', () => {
    createWorkerInterface({ id: 'sw-1', responseTimeout: 5000 });
    dispatchToSelf(makeEvent('client-1').event);
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sw-1', responseTimeout: 5000 }),
    );
  });
});
