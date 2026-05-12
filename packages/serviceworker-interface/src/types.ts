import type { BaseInitConfig } from '@actualwave/deferred-data-access/interface';

type TransportKeys = 'subscribe' | 'unsubscribe' | 'sendMessage' | 'preprocessResponse';

// Transport fields are wired automatically based on the execution context.
export type PageConfig = Omit<BaseInitConfig, TransportKeys>;

export type ClientConnection = {
  clientId: string;
  root: unknown;
  stop: () => void;
};

export type WorkerConfig = Omit<BaseInitConfig, TransportKeys> & {
  // Called once per client after its DDA handshake completes.
  onConnect?: (connection: ClientConnection) => void;
};

export type WorkerInterfaceServer = {
  stop: () => void;
};
