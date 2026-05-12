/**
 * @jest-environment jsdom
 */
import { MFEInterfaceChannel } from './channel';
import { MFEInterfaceBus } from './bus';

jest.mock('./mfe-interface', () => ({
  connectMFEInterface: jest.fn(),
}));

const { connectMFEInterface } = jest.requireMock('./mfe-interface');

const makeElement = (): HTMLElement => document.createElement('div');

const makeConnection = (overrides: Partial<{ stop: () => void; root: unknown }> = {}) => ({
  stop: jest.fn(),
  root: {},
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  (connectMFEInterface as jest.Mock).mockResolvedValue(makeConnection());
});

// ---------------------------------------------------------------------------
// MFEInterfaceChannel.create
// ---------------------------------------------------------------------------

describe('MFEInterfaceChannel.create', () => {
  it('calls connectMFEInterface for both MFEs', async () => {
    await MFEInterfaceChannel.create({ element: makeElement() }, { element: makeElement() });
    expect(connectMFEInterface).toHaveBeenCalledTimes(2);
  });

  it('returns channel with both connections', async () => {
    const connA = makeConnection();
    const connB = makeConnection();
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(connA)
      .mockResolvedValueOnce(connB);

    const channel = await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    expect(channel.connectionA).toBe(connA);
    expect(channel.connectionB).toBe(connB);
  });

  it('overrides user-supplied root with the relay proxy', async () => {
    const userRoot = { custom: true };
    await MFEInterfaceChannel.create(
      { element: makeElement(), root: userRoot },
      { element: makeElement() },
    );

    const configA = (connectMFEInterface as jest.Mock).mock.calls[0][0];
    expect(configA.root).not.toBe(userRoot);
    // relay root is a DDA proxy (function-typed)
    expect(typeof configA.root).toBe('function');
  });

  it('relay root for MFE-A forwards method calls to MFE-B root', async () => {
    const rootB = { greet: jest.fn().mockReturnValue('hello from B') };
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection({ root: {} }))
      .mockResolvedValueOnce(makeConnection({ root: rootB }));

    await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    const relayForA = (connectMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await relayForA.greet();

    expect(rootB.greet).toHaveBeenCalled();
    expect(result).toBe('hello from B');
  });

  it('relay root for MFE-B forwards method calls to MFE-A root', async () => {
    const rootA = { ping: jest.fn().mockReturnValue('pong from A') };
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection({ root: rootA }))
      .mockResolvedValueOnce(makeConnection({ root: {} }));

    await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    const relayForB = (connectMFEInterface as jest.Mock).mock.calls[1][0].root;
    const result = await relayForB.ping();

    expect(rootA.ping).toHaveBeenCalled();
    expect(result).toBe('pong from A');
  });

  it('relay forwards method arguments correctly', async () => {
    const rootB = { add: jest.fn().mockImplementation((a: number, b: number) => a + b) };
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection({ root: {} }))
      .mockResolvedValueOnce(makeConnection({ root: rootB }));

    await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    const relayForA = (connectMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await relayForA.add(3, 4);

    expect(rootB.add).toHaveBeenCalledWith(3, 4);
    expect(result).toBe(7);
  });

  it('relay forwards nested property method calls', async () => {
    const rootB = { module: { compute: jest.fn().mockReturnValue(99) } };
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection({ root: {} }))
      .mockResolvedValueOnce(makeConnection({ root: rootB }));

    await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    const relayForA = (connectMFEInterface as jest.Mock).mock.calls[0][0].root;
    const result = await relayForA.module.compute();

    expect(rootB.module.compute).toHaveBeenCalled();
    expect(result).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// MFEInterfaceChannel.stop
// ---------------------------------------------------------------------------

describe('MFEInterfaceChannel.stop', () => {
  it('stops both connections', async () => {
    const stopA = jest.fn();
    const stopB = jest.fn();
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection({ stop: stopA }))
      .mockResolvedValueOnce(makeConnection({ stop: stopB }));

    const channel = await MFEInterfaceChannel.create(
      { element: makeElement() },
      { element: makeElement() },
    );

    channel.stop();
    expect(stopA).toHaveBeenCalled();
    expect(stopB).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// MFEInterfaceBus.createChannel
// ---------------------------------------------------------------------------

describe('MFEInterfaceBus.createChannel', () => {
  it('creates a channel and registers both connections in the bus', async () => {
    const connA = makeConnection();
    const connB = makeConnection();
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(connA)
      .mockResolvedValueOnce(connB);

    const bus = new MFEInterfaceBus();
    const elA = makeElement();
    const elB = makeElement();
    const channel = await bus.createChannel({ element: elA }, { element: elB });

    expect(channel.connectionA).toBe(connA);
    expect(channel.connectionB).toBe(connB);
    expect(bus.get(elA)).toBe(connA);
    expect(bus.get(elB)).toBe(connB);
    expect(bus.size).toBe(2);
  });

  it('channel and bus manage connections independently', async () => {
    (connectMFEInterface as jest.Mock)
      .mockResolvedValueOnce(makeConnection())
      .mockResolvedValueOnce(makeConnection());

    const bus = new MFEInterfaceBus();
    const elA = makeElement();
    const elB = makeElement();
    const channel = await bus.createChannel({ element: elA }, { element: elB });

    // Stopping the channel does not remove the entries from the bus
    channel.stop();
    expect(bus.size).toBe(2);

    // Removing from the bus does not stop the channel connections
    bus.disconnect(elA);
    expect(bus.size).toBe(1);
  });
});
