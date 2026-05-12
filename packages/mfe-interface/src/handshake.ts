import { initializeMFEInterface, connectMFEInterface } from './mfe-interface';
import { Connection, MFEInterfaceConfig } from './types';

// Private method name injected into every handshake-enabled root.
// Prefixed and suffixed to minimise accidental collision with user APIs.
const HANDSHAKE_METHOD = '__mfe_handshake__';

export type HandshakePayload = Record<string, unknown>;

// GUEST (MFE) side: called when the host initiates a handshake.
// The return value is sent back to the host as the guest's response payload.
export interface GuestHandshakeConfig {
  onHandshake?: (
    hostPayload: HandshakePayload,
  ) => HandshakePayload | void | Promise<HandshakePayload | void>;
}

// HOST (shell) side: payload to send and optional callback for the response.
export interface HostHandshakeConfig {
  payload?: HandshakePayload;
  onHandshake?: (guestPayload: HandshakePayload) => void | Promise<void>;
}

// Carried on the host-side connection after a successful handshake.
export interface HandshakeInfo {
  sent: HandshakePayload;
  received: HandshakePayload;
}

export interface HandshakeConnection extends Connection {
  handshake: HandshakeInfo;
}

// ---------------------------------------------------------------------------
// MFE (GUEST) side
// ---------------------------------------------------------------------------

// Wraps the user root to add a private `__mfe_handshake__` responder, then
// initialises normally. The handshake is passive: the MFE just waits for
// the shell to call it; `onHandshake` fires when that happens and its return
// value becomes the payload the shell receives.
export const initializeMFEInterfaceWithHandshake = (
  {
    handshake = {},
    root,
    ...config
  }: MFEInterfaceConfig & { handshake?: GuestHandshakeConfig },
): Promise<Connection> => {
  const rootObj =
    root != null && typeof root === 'object' ? (root as object) : {};

  const handshakeRoot = {
    ...rootObj,
    [HANDSHAKE_METHOD]: async (
      hostPayload: HandshakePayload,
    ): Promise<HandshakePayload> => {
      const response = handshake.onHandshake
        ? await handshake.onHandshake(hostPayload)
        : undefined;
      return (response as HandshakePayload | undefined) ?? {};
    },
  };

  return initializeMFEInterface({ ...config, root: handshakeRoot });
};

// ---------------------------------------------------------------------------
// Shell (HOST) side
// ---------------------------------------------------------------------------

// Connects to the MFE and immediately performs the application-level handshake:
//   1. Calls the MFE's `__mfe_handshake__` with `payload` (defaults to {}).
//   2. Awaits the MFE's response.
//   3. Fires the local `onHandshake` with the response.
//
// Returns a `HandshakeConnection` that extends `Connection` with a `handshake`
// field containing both sides' payloads for later inspection.
export const connectMFEInterfaceWithHandshake = async ({
  handshake = {},
  ...config
}: MFEInterfaceConfig & {
  handshake?: HostHandshakeConfig;
}): Promise<HandshakeConnection> => {
  const connection = await connectMFEInterface(config);

  const sent: HandshakePayload = handshake.payload ?? {};
  const received: HandshakePayload =
    ((await (connection.root as any)[HANDSHAKE_METHOD](sent)) as HandshakePayload) ?? {};

  await handshake.onHandshake?.(received);

  return { ...connection, handshake: { sent, received } };
};
