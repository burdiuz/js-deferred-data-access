/**
 * @jest-environment jsdom
 */
import { initializeMFEInterface, connectMFEInterface } from './mfe-interface';
import { MFEInterfaceBus } from './bus';
import { HOST_EVENT, GUEST_EVENT } from './types';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

jest.mock('@actualwave/deferred-data-access/interface', () => ({
  initialize: jest.fn().mockResolvedValue({ stop: jest.fn(), root: null }),
  InterfaceType: { HOST: 'host', GUEST: 'guest' },
}));

const { initialize } = jest.requireMock('@actualwave/deferred-data-access/interface');

const makeElement = (): HTMLElement => document.createElement('div');

beforeEach(() => {
  jest.clearAllMocks();
  (initialize as jest.Mock).mockResolvedValue({ stop: jest.fn(), root: null });
});

// ---------------------------------------------------------------------------
// initializeMFEInterface
// ---------------------------------------------------------------------------

describe('initializeMFEInterface', () => {
  it('calls initialize with GUEST type', async () => {
    await initializeMFEInterface({ element: makeElement() });
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.GUEST }),
    );
  });

  it('sendMessage dispatches guest event on element by default', async () => {
    const element = makeElement();
    const received: CustomEvent[] = [];
    element.addEventListener(GUEST_EVENT, (e) => received.push(e as CustomEvent));

    await initializeMFEInterface({ element });
    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage({ id: 1 });

    expect(received).toHaveLength(1);
    expect(received[0].detail).toEqual({ id: 1 });
  });

  it('subscribe listens for host event on element by default', async () => {
    const element = makeElement();
    await initializeMFEInterface({ element });

    const { subscribe } = initialize.mock.calls[0][0];
    const fn = jest.fn();
    const spy = jest.spyOn(element, 'addEventListener');
    subscribe(fn);
    expect(spy).toHaveBeenCalledWith(HOST_EVENT, fn);
  });

  it('unsubscribe removes listener for host event', async () => {
    const element = makeElement();
    await initializeMFEInterface({ element });

    const { unsubscribe } = initialize.mock.calls[0][0];
    const fn = jest.fn();
    const spy = jest.spyOn(element, 'removeEventListener');
    unsubscribe(fn);
    expect(spy).toHaveBeenCalledWith(HOST_EVENT, fn);
  });

  it('uses custom event names when provided', async () => {
    const element = makeElement();
    await initializeMFEInterface({
      element,
      hostEventName: 'custom-host',
      guestEventName: 'custom-guest',
    });

    const { sendMessage, subscribe } = initialize.mock.calls[0][0];

    const received: CustomEvent[] = [];
    element.addEventListener('custom-guest', (e) => received.push(e as CustomEvent));
    sendMessage('ping');
    expect(received[0].detail).toBe('ping');

    const spy = jest.spyOn(element, 'addEventListener');
    subscribe(jest.fn());
    expect(spy).toHaveBeenCalledWith('custom-host', expect.any(Function));
  });

  it('passes extra params through to initialize', async () => {
    const element = makeElement();
    const root = { greet: () => 'hi' };
    await initializeMFEInterface({ element, root, id: 'mf-a' });
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ root, id: 'mf-a' }),
    );
  });
});

// ---------------------------------------------------------------------------
// connectMFEInterface
// ---------------------------------------------------------------------------

describe('connectMFEInterface', () => {
  it('calls initialize with HOST type', async () => {
    await connectMFEInterface({ element: makeElement() });
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ type: InterfaceType.HOST }),
    );
  });

  it('sendMessage dispatches host event on element by default', async () => {
    const element = makeElement();
    const received: CustomEvent[] = [];
    element.addEventListener(HOST_EVENT, (e) => received.push(e as CustomEvent));

    await connectMFEInterface({ element });
    const { sendMessage } = initialize.mock.calls[0][0];
    sendMessage('msg');

    expect(received).toHaveLength(1);
    expect(received[0].detail).toBe('msg');
  });

  it('subscribe listens for guest event on element by default', async () => {
    const element = makeElement();
    await connectMFEInterface({ element });

    const { subscribe } = initialize.mock.calls[0][0];
    const fn = jest.fn();
    const spy = jest.spyOn(element, 'addEventListener');
    subscribe(fn);
    expect(spy).toHaveBeenCalledWith(GUEST_EVENT, fn);
  });

  it('unsubscribe removes listener for guest event', async () => {
    const element = makeElement();
    await connectMFEInterface({ element });

    const { unsubscribe } = initialize.mock.calls[0][0];
    const fn = jest.fn();
    const spy = jest.spyOn(element, 'removeEventListener');
    unsubscribe(fn);
    expect(spy).toHaveBeenCalledWith(GUEST_EVENT, fn);
  });
});

// ---------------------------------------------------------------------------
// preprocessResponse
// ---------------------------------------------------------------------------

describe('preprocessResponse', () => {
  it('extracts detail from a CustomEvent', async () => {
    await initializeMFEInterface({ element: makeElement() });
    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = new CustomEvent('test', { detail: { type: 'request', id: 'x' } });
    expect(preprocessResponse(event)).toEqual({ type: 'request', id: 'x' });
  });

  it('passes non-CustomEvent value through unchanged', async () => {
    await initializeMFEInterface({ element: makeElement() });
    const { preprocessResponse } = initialize.mock.calls[0][0];
    const plain = { type: 'request', id: 'y' };
    expect(preprocessResponse(plain)).toBe(plain);
  });

  it('handles null detail', async () => {
    await initializeMFEInterface({ element: makeElement() });
    const { preprocessResponse } = initialize.mock.calls[0][0];
    const event = new CustomEvent('test', { detail: null });
    expect(preprocessResponse(event)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MFEInterfaceBus
// ---------------------------------------------------------------------------

describe('MFEInterfaceBus', () => {
  it('connect returns a connection', async () => {
    const bus = new MFEInterfaceBus();
    const connection = await bus.connect({ element: makeElement() });
    expect(connection).toBeDefined();
    expect(typeof connection.stop).toBe('function');
  });

  it('connect caches connection and returns same on second call', async () => {
    const bus = new MFEInterfaceBus();
    const element = makeElement();
    const c1 = await bus.connect({ element });
    const c2 = await bus.connect({ element });
    expect(c1).toBe(c2);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('size reflects number of active connections', async () => {
    const bus = new MFEInterfaceBus();
    expect(bus.size).toBe(0);
    await bus.connect({ element: makeElement() });
    expect(bus.size).toBe(1);
    await bus.connect({ element: makeElement() });
    expect(bus.size).toBe(2);
  });

  it('get returns the stored connection', async () => {
    const bus = new MFEInterfaceBus();
    const element = makeElement();
    const connection = await bus.connect({ element });
    expect(bus.get(element)).toBe(connection);
  });

  it('get returns undefined for unknown element', () => {
    const bus = new MFEInterfaceBus();
    expect(bus.get(makeElement())).toBeUndefined();
  });

  it('disconnect calls stop and removes connection', async () => {
    const stop = jest.fn();
    (initialize as jest.Mock).mockResolvedValueOnce({ stop, root: null });
    const bus = new MFEInterfaceBus();
    const element = makeElement();
    await bus.connect({ element });
    bus.disconnect(element);
    expect(stop).toHaveBeenCalled();
    expect(bus.size).toBe(0);
    expect(bus.get(element)).toBeUndefined();
  });

  it('disconnect is a no-op for unknown element', () => {
    const bus = new MFEInterfaceBus();
    expect(() => bus.disconnect(makeElement())).not.toThrow();
  });

  it('disconnectAll stops all connections and clears the cache', async () => {
    const stop1 = jest.fn();
    const stop2 = jest.fn();
    (initialize as jest.Mock)
      .mockResolvedValueOnce({ stop: stop1, root: null })
      .mockResolvedValueOnce({ stop: stop2, root: null });
    const bus = new MFEInterfaceBus();
    await bus.connect({ element: makeElement() });
    await bus.connect({ element: makeElement() });
    bus.disconnectAll();
    expect(stop1).toHaveBeenCalled();
    expect(stop2).toHaveBeenCalled();
    expect(bus.size).toBe(0);
  });

  it('forEach calls callback once per connection with root and element', async () => {
    const root1 = { api: 'a' };
    const root2 = { api: 'b' };
    (initialize as jest.Mock)
      .mockResolvedValueOnce({ stop: jest.fn(), root: root1 })
      .mockResolvedValueOnce({ stop: jest.fn(), root: root2 });
    const bus = new MFEInterfaceBus();
    const el1 = makeElement();
    const el2 = makeElement();
    await bus.connect({ element: el1 });
    await bus.connect({ element: el2 });
    const cb = jest.fn();
    await bus.forEach(cb);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(root1, el1);
    expect(cb).toHaveBeenCalledWith(root2, el2);
  });

  it('forEach awaits async callbacks', async () => {
    const root = {};
    (initialize as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });
    const bus = new MFEInterfaceBus();
    await bus.connect({ element: makeElement() });
    let resolved = false;
    await bus.forEach(async () => {
      await Promise.resolve();
      resolved = true;
    });
    expect(resolved).toBe(true);
  });
});
