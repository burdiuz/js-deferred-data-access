import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';
import { createDataChannelInterface, waitForOpen } from './webrtc-interface';

jest.mock('@actualwave/deferred-data-access/interface');

const mockInitialize = initialize as jest.MockedFunction<typeof initialize>;

// ---------------------------------------------------------------------------
// RTCDataChannel mock
// ---------------------------------------------------------------------------

class MockDataChannel {
  readyState: RTCDataChannelState;
  send = jest.fn();
  close = jest.fn();
  listeners = new Map<string, Set<Function>>();

  constructor(state: RTCDataChannelState = 'open') {
    this.readyState = state;
  }

  addEventListener(type: string, fn: Function) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  }

  removeEventListener(type: string, fn: Function) {
    this.listeners.get(type)?.delete(fn);
  }

  emit(type: string, event: unknown = {}) {
    for (const fn of this.listeners.get(type) ?? []) fn(event);
  }
}

const makeResult = (overrides: Record<string, unknown> = {}) =>
  ({ stop: jest.fn(), pool: {} as any, root: null, ...overrides } as any);

beforeEach(() => {
  jest.clearAllMocks();
  mockInitialize.mockResolvedValue(makeResult());
});

// ---------------------------------------------------------------------------
// createDataChannelInterface
// ---------------------------------------------------------------------------

describe('createDataChannelInterface', () => {
  it('calls initialize with the specified type', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.HOST }),
    );
  });

  it('passes extra config through to initialize', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({
      channel: ch as any,
      type: InterfaceType.GUEST,
      id: 'peer-a',
      handshakeTimeout: 5000,
    });
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'peer-a', handshakeTimeout: 5000 }),
    );
  });

  it('sendMessage serialises data as JSON and calls channel.send', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    const { sendMessage } = (mockInitialize.mock.calls[0] as any)[0];
    sendMessage({ type: 'ping' });
    expect(ch.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
  });

  it('subscribe attaches a message listener to the channel', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    const { subscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    subscribe(fn);
    expect(ch.listeners.get('message')?.has(fn)).toBe(true);
  });

  it('unsubscribe removes the message listener from the channel', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    const { subscribe, unsubscribe } = (mockInitialize.mock.calls[0] as any)[0];
    const fn = jest.fn();
    subscribe(fn);
    unsubscribe(fn);
    expect(ch.listeners.get('message')?.has(fn)).toBe(false);
  });

  it('preprocessResponse parses JSON from event.data', async () => {
    const ch = new MockDataChannel();
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    const { preprocessResponse } = (mockInitialize.mock.calls[0] as any)[0];
    const payload = { value: 42 };
    expect(preprocessResponse({ data: JSON.stringify(payload) })).toEqual(payload);
  });

  it('close event on the channel calls stop()', async () => {
    const ch = new MockDataChannel();
    const originalStop = jest.fn();
    mockInitialize.mockResolvedValue(makeResult({ stop: originalStop }));
    await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    ch.emit('close');
    expect(originalStop).toHaveBeenCalled();
  });

  it('stop() removes the close listener and calls original stop', async () => {
    const ch = new MockDataChannel();
    const originalStop = jest.fn();
    mockInitialize.mockResolvedValue(makeResult({ stop: originalStop }));
    const { stop } = await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    stop();
    expect(originalStop).toHaveBeenCalled();
    // After manual stop the close listener is removed — emitting close should not call stop again.
    ch.emit('close');
    expect(originalStop).toHaveBeenCalledTimes(1);
  });

  it('returns all result properties from initialize', async () => {
    const ch = new MockDataChannel();
    const result = await createDataChannelInterface({ channel: ch as any, type: InterfaceType.HOST });
    expect(result).toHaveProperty('stop');
    expect(result).toHaveProperty('pool');
  });
});

// ---------------------------------------------------------------------------
// waitForOpen
// ---------------------------------------------------------------------------

describe('waitForOpen', () => {
  it("resolves immediately when state is 'open'", async () => {
    const ch = new MockDataChannel('open');
    await expect(waitForOpen(ch as any)).resolves.toBe(ch);
  });

  it("rejects immediately when state is 'closing'", async () => {
    const ch = new MockDataChannel('closing');
    await expect(waitForOpen(ch as any)).rejects.toThrow('closing');
  });

  it("rejects immediately when state is 'closed'", async () => {
    const ch = new MockDataChannel('closed');
    await expect(waitForOpen(ch as any)).rejects.toThrow('closed');
  });

  it("resolves when 'open' event fires while connecting", async () => {
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any);
    ch.emit('open');
    await expect(p).resolves.toBe(ch);
  });

  it("rejects when 'close' event fires while connecting", async () => {
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any);
    ch.emit('close', new Event('close'));
    await expect(p).rejects.toBeInstanceOf(Event);
  });

  it("rejects when 'error' event fires while connecting", async () => {
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any);
    ch.emit('error', new Event('error'));
    await expect(p).rejects.toBeInstanceOf(Event);
  });

  it('cleans up all listeners after resolving', async () => {
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any);
    ch.emit('open');
    await p;
    expect(ch.listeners.get('open')?.size).toBe(0);
    expect(ch.listeners.get('close')?.size).toBe(0);
    expect(ch.listeners.get('error')?.size).toBe(0);
  });

  it('cleans up all listeners after rejecting', async () => {
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any);
    ch.emit('close', new Event('close'));
    await p.catch(() => {});
    expect(ch.listeners.get('open')?.size).toBe(0);
    expect(ch.listeners.get('close')?.size).toBe(0);
    expect(ch.listeners.get('error')?.size).toBe(0);
  });

  it('rejects with timeout error when timeout elapses', async () => {
    jest.useFakeTimers();
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any, 500);
    jest.advanceTimersByTime(500);
    await expect(p).rejects.toThrow('did not open within 500ms');
    jest.useRealTimers();
  });

  it('cleans up listeners after timeout', async () => {
    jest.useFakeTimers();
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any, 100);
    jest.advanceTimersByTime(100);
    await p.catch(() => {});
    expect(ch.listeners.get('open')?.size).toBe(0);
    jest.useRealTimers();
  });

  it('does not time out when timeout is 0', async () => {
    jest.useFakeTimers();
    const ch = new MockDataChannel('connecting');
    const p = waitForOpen(ch as any, 0);
    jest.advanceTimersByTime(10000);
    // Should still be pending — resolve it manually
    ch.emit('open');
    await expect(p).resolves.toBe(ch);
    jest.useRealTimers();
  });
});
