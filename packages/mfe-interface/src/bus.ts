import { Connection, MFEInterfaceConfig } from './types';
import { connectMFEInterface } from './mfe-interface';
import { MFEInterfaceChannel } from './channel';
import {
  HostHandshakeConfig,
  HandshakeConnection,
  connectMFEInterfaceWithHandshake,
} from './handshake';

// Manages shell-side connections to multiple MFEs. The root HTMLElement of
// each MFE is used as the map key so the same element is never connected twice.
export class MFEInterfaceBus {
  private readonly connections = new Map<HTMLElement, Connection>();

  // Returns the cached connection if the element was already connected,
  // avoiding a duplicate handshake.
  async connect(config: MFEInterfaceConfig): Promise<Connection> {
    const { element } = config;
    if (this.connections.has(element)) {
      return this.connections.get(element)!;
    }
    const connection = await connectMFEInterface(config);
    this.connections.set(element, connection);
    return connection;
  }

  // Like `connect`, but performs the application-level handshake after the
  // DDA channel is established. Returns a HandshakeConnection so the caller
  // can inspect what each side exchanged.
  async connectWithHandshake(
    config: MFEInterfaceConfig & { handshake?: HostHandshakeConfig },
  ): Promise<HandshakeConnection> {
    const { element } = config;
    if (this.connections.has(element)) {
      return this.connections.get(element)! as HandshakeConnection;
    }
    const connection = await connectMFEInterfaceWithHandshake(config);
    this.connections.set(element, connection);
    return connection;
  }

  // Connects two MFEs as a transparent relay channel and registers both
  // connections in the bus so they can be accessed or disconnected individually
  // via `get(element)` / `disconnect(element)`.
  async createChannel(
    configA: MFEInterfaceConfig,
    configB: MFEInterfaceConfig,
  ): Promise<MFEInterfaceChannel> {
    const channel = await MFEInterfaceChannel.create(configA, configB);
    this.connections.set(configA.element, channel.connectionA);
    this.connections.set(configB.element, channel.connectionB);
    return channel;
  }

  disconnect(element: HTMLElement): void {
    const connection = this.connections.get(element);
    if (connection) {
      connection.stop();
      this.connections.delete(element);
    }
  }

  disconnectAll(): void {
    for (const connection of this.connections.values()) {
      connection.stop();
    }
    this.connections.clear();
  }

  get(element: HTMLElement): Connection | undefined {
    return this.connections.get(element);
  }

  get size(): number {
    return this.connections.size;
  }

  // Calls `callback` for every connected MFE in parallel. Useful for
  // broadcasting a shell-wide event (e.g. theme change, auth expiry).
  async forEach(
    callback: (root: unknown, element: HTMLElement) => void | Promise<void>,
  ): Promise<void> {
    await Promise.all(
      Array.from(this.connections.entries()).map(([element, { root }]) =>
        callback(root, element),
      ),
    );
  }
}
