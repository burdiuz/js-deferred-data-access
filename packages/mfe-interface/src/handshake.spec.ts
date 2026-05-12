/**
 * @jest-environment jsdom
 */
import {
  initializeMFEInterfaceWithHandshake,
  connectMFEInterfaceWithHandshake,
} from './handshake';
import { MFEInterfaceBus } from './bus';

jest.mock('./mfe-interface', () => ({
  initializeMFEInterface: jest.fn().mockResolvedValue({ stop: jest.fn(), root: null }),
  connectMFEInterface: jest.fn(),
}));

const { initializeMFEInterface, connectMFEInterface } =
  jest.requireMock('./mfe-interface');

const makeElement = (): HTMLElement => document.createElement('div');

const makeRoot = (handshakeResponse: Record<string, unknown> = {}) => ({
  __mfe_handshake__: jest.fn().mockResolvedValue(handshakeResponse),
  someMethod: jest.fn().mockReturnValue('ok'),
});

beforeEach(() => {
  jest.clearAllMocks();
  (initializeMFEInterface as jest.Mock).mockResolvedValue({
    stop: jest.fn(),
    root: makeRoot(),
  });
  (connectMFEInterface as jest.Mock).mockResolvedValue({
    stop: jest.fn(),
    root: makeRoot(),
  });
});

// ---------------------------------------------------------------------------
// initializeMFEInterfaceWithHandshake (GUEST side)
// ---------------------------------------------------------------------------

describe('initializeMFEInterfaceWithHandshake', () => {
  it('delegates to initializeMFEInterface', async () => {
    await initializeMFEInterfaceWithHandshake({ element: makeElement() });
    expect(initializeMFEInterface).toHaveBeenCalledTimes(1);
  });

  it('injects __mfe_handshake__ into the root', async () => {
    const userRoot = { doWork: jest.fn() };
    await initializeMFEInterfaceWithHandshake({
      element: makeElement(),
      root: userRoot,
    });

    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    expect(typeof passedRoot.__mfe_handshake__).toBe('function');
    expect(passedRoot.doWork).toBe(userRoot.doWork);
  });

  it('works when no root is provided', async () => {
    await initializeMFEInterfaceWithHandshake({ element: makeElement() });
    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    expect(typeof passedRoot.__mfe_handshake__).toBe('function');
  });

  it('handshake handler calls onHandshake with host payload', async () => {
    const onHandshake = jest.fn().mockResolvedValue({ ready: true });
    await initializeMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { onHandshake },
    });

    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    const hostPayload = { theme: 'dark' };
    await passedRoot.__mfe_handshake__(hostPayload);

    expect(onHandshake).toHaveBeenCalledWith(hostPayload);
  });

  it('handshake handler returns onHandshake result to host', async () => {
    const onHandshake = jest.fn().mockResolvedValue({ version: '2' });
    await initializeMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { onHandshake },
    });

    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await passedRoot.__mfe_handshake__({});

    expect(result).toEqual({ version: '2' });
  });

  it('handshake handler returns {} when onHandshake returns void', async () => {
    const onHandshake = jest.fn().mockResolvedValue(undefined);
    await initializeMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { onHandshake },
    });

    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await passedRoot.__mfe_handshake__({});

    expect(result).toEqual({});
  });

  it('handshake handler returns {} when no onHandshake is provided', async () => {
    await initializeMFEInterfaceWithHandshake({ element: makeElement() });
    const passedRoot = (initializeMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await passedRoot.__mfe_handshake__({ data: 'x' });
    expect(result).toEqual({});
  });

  it('returns the connection from initializeMFEInterface', async () => {
    const expectedConn = { stop: jest.fn(), root: makeRoot() };
    (initializeMFEInterface as jest.Mock).mockResolvedValueOnce(expectedConn);

    const conn = await initializeMFEInterfaceWithHandshake({ element: makeElement() });
    expect(conn).toBe(expectedConn);
  });
});

// ---------------------------------------------------------------------------
// connectMFEInterfaceWithHandshake (HOST side)
// ---------------------------------------------------------------------------

describe('connectMFEInterfaceWithHandshake', () => {
  it('calls connectMFEInterface to establish the DDA channel', async () => {
    await connectMFEInterfaceWithHandshake({ element: makeElement() });
    expect(connectMFEInterface).toHaveBeenCalledTimes(1);
  });

  it('calls __mfe_handshake__ on the remote root', async () => {
    const root = makeRoot();
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    await connectMFEInterfaceWithHandshake({ element: makeElement() });

    expect(root.__mfe_handshake__).toHaveBeenCalled();
  });

  it('sends payload to remote __mfe_handshake__', async () => {
    const root = makeRoot();
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const payload = { user: 'alice', theme: 'dark' };
    await connectMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { payload },
    });

    expect(root.__mfe_handshake__).toHaveBeenCalledWith(payload);
  });

  it('sends empty object when no payload is provided', async () => {
    const root = makeRoot();
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    await connectMFEInterfaceWithHandshake({ element: makeElement() });

    expect(root.__mfe_handshake__).toHaveBeenCalledWith({});
  });

  it('calls onHandshake with the response from the remote side', async () => {
    const remoteResponse = { version: '1', ready: true };
    const root = makeRoot(remoteResponse);
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const onHandshake = jest.fn();
    await connectMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { onHandshake },
    });

    expect(onHandshake).toHaveBeenCalledWith(remoteResponse);
  });

  it('returns HandshakeConnection with sent and received payloads', async () => {
    const remoteResponse = { ready: true };
    const root = makeRoot(remoteResponse);
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const payload = { theme: 'light' };
    const conn = await connectMFEInterfaceWithHandshake({
      element: makeElement(),
      handshake: { payload },
    });

    expect(conn.handshake.sent).toEqual(payload);
    expect(conn.handshake.received).toEqual(remoteResponse);
  });

  it('handshake.sent is {} when no payload is configured', async () => {
    const conn = await connectMFEInterfaceWithHandshake({ element: makeElement() });
    expect(conn.handshake.sent).toEqual({});
  });

  it('still returns a valid connection alongside handshake data', async () => {
    const stop = jest.fn();
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({
      stop,
      root: makeRoot(),
    });

    const conn = await connectMFEInterfaceWithHandshake({ element: makeElement() });
    expect(conn.stop).toBe(stop);
  });
});

// ---------------------------------------------------------------------------
// MFEInterfaceBus.connectWithHandshake
// ---------------------------------------------------------------------------

describe('MFEInterfaceBus.connectWithHandshake', () => {
  it('connects and registers the connection', async () => {
    const root = makeRoot({ ok: true });
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const bus = new MFEInterfaceBus();
    const element = makeElement();
    const conn = await bus.connectWithHandshake({ element });

    expect(bus.get(element)).toBe(conn);
    expect(bus.size).toBe(1);
    expect(conn.handshake).toBeDefined();
  });

  it('returns cached connection on repeated calls for the same element', async () => {
    const root = makeRoot();
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const bus = new MFEInterfaceBus();
    const element = makeElement();
    const c1 = await bus.connectWithHandshake({ element });
    const c2 = await bus.connectWithHandshake({ element });

    expect(c1).toBe(c2);
    expect(connectMFEInterface).toHaveBeenCalledTimes(1);
  });

  it('forwards payload and returns received data', async () => {
    const remoteResponse = { mfeVersion: '3' };
    const root = makeRoot(remoteResponse);
    (connectMFEInterface as jest.Mock).mockResolvedValueOnce({ stop: jest.fn(), root });

    const bus = new MFEInterfaceBus();
    const payload = { shellVersion: '5' };
    const conn = await bus.connectWithHandshake({
      element: makeElement(),
      handshake: { payload },
    });

    expect(conn.handshake.sent).toEqual(payload);
    expect(conn.handshake.received).toEqual(remoteResponse);
  });
});
