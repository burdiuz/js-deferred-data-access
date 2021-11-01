import { InterfaceCallbacks } from '@actualwave/deferred-data-access/interface';

export type InitConfig = InterfaceCallbacks & {
  ws?: unknown;
  eventEmitter?: unknown;
  messageSender?: unknown;
};
