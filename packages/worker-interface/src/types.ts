import {
  InterfaceType,
  InterfaceCallbacks,
  BaseInitConfig,
} from '@actualwave/deferred-data-access/interface';

export type WIInitConfig = InterfaceCallbacks &
  BaseInitConfig & {
    type: InterfaceType;
  };

export type WIHostConfig = BaseInitConfig & {
  worker?: unknown;
};

export type WIWorkerConfig = BaseInitConfig & {
  worker?: unknown;
  eventEmitter?: unknown;
  messagePort?: unknown;
};
