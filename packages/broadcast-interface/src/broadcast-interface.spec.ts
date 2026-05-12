import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';
import { createBroadcastInterface } from './broadcast-interface';

jest.mock('@actualwave/deferred-data-access/interface');

const mockInitialize = initialize as jest.MockedFunction<typeof initialize>;

// ---------------------------------------------------------------------------
// BroadcastChannel mock
// ---------------------------------------------------------------------------

class MockBroadcastChannel {
  name: string;
  listeners = new Map<string, Set<Function>>();
  postMessage = jest.fn();
  close = jest.fn();

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  addEventListener(type: string, fn: Function) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  }

  removeEventListener(type: string, fn: Function) {
    this.listeners.get(type)?.delete(fn);
  }

  static instances: MockBroadcastChannel[] = [];
  static reset() { MockBroadcastChannel.instances = []; }
}

(globalThis as any).BroadcastChannel = MockBroadcastChannel;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const makeResult = (overrides: Record<string, unknown> = {}) =>
  Promise.resolve({ stop: jest.fn(), pool: {} as any, root: null, ...overrides } as any);

beforeEach(() => {
  jest.clearAllMocks();
  MockBroadcastChannel.reset();
  mockInitialize.mockResolvedValue(makeResult() as any);
});

describe('createBroadcastInterface', () => {
  it('creates a BroadcastChannel with the given name', async () => {
    await createBroadcastInterface({ channelName: 'my-channel', type: InterfaceType.HOST });
    expect(MockBroadcastChannel.instances[0].name).toBe('my-channel');
  });

  it('passes the requested type to initialize', async () => {
    await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.GUEST });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.GUEST }),
    );
  });

  it('passes extra config options through to initialize', async () => {
    await createBroadcastInterface({
      channelName: 'ch',
      type: InterfaceType.HOST,
      id: 'tab-1',
      handshakeTimeout: 3000,
    });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tab-1', handshakeTimeout: 3000 }),
    );
  });

  it('subscribe attaches a message listener to the channel', async () => {
    await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    const { subscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    subscribe(fn);
    expect(MockBroadcastChannel.instances[0].listeners.get('message')?.has(fn)).toBe(true);
  });

  it('unsubscribe removes the message listener from the channel', async () => {
    await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    const { subscribe, unsubscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    subscribe(fn);
    unsubscribe(fn);
    expect(MockBroadcastChannel.instances[0].listeners.get('message')?.has(fn)).toBe(false);
  });

  it('sendMessage calls channel.postMessage', async () => {
    await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    const { sendMessage } = (mockInitialize.mock.calls[0] as any)[0];
    sendMessage({ cmd: 'ping' });
    expect(MockBroadcastChannel.instances[0].postMessage).toHaveBeenCalledWith({ cmd: 'ping' });
  });

  it('preprocessResponse extracts event.data', async () => {
    await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    const { preprocessResponse } = (mockInitialize.mock.calls[0] as any)[0];
    expect(preprocessResponse!({ data: 'payload' })).toBe('payload');
  });

  it('stop() calls the original stop and closes the channel', async () => {
    const originalStop = jest.fn();
    mockInitialize.mockResolvedValue(makeResult({ stop: originalStop }) as any);
    const { stop } = await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    stop();
    expect(originalStop).toHaveBeenCalled();
    expect(MockBroadcastChannel.instances[0].close).toHaveBeenCalled();
  });

  it('returns the result from initialize with stop overridden', async () => {
    const result = await createBroadcastInterface({ channelName: 'ch', type: InterfaceType.HOST });
    expect(result).toHaveProperty('stop');
    expect(result).toHaveProperty('pool');
    expect(typeof result.stop).toBe('function');
  });
});
