///<reference path="../../../typings/@actualwave/deferred-data-access/utils/index.d.ts" />
///<reference path="../../../typings/@actualwave/deferred-data-access/resource/index.d.ts" />
import { ResourceObject } from '@actualwave/deferred-data-access/resource';
import { ICommand } from '@actualwave/deferred-data-access/utils';
import { InterfaceType, MessageType } from './utils';

export type WorkerCallbacks = {
  subscribe: (listener: (event: unknown) => void) => void;
  unsubscribe: (listener: (event: unknown) => void) => void;
  postMessage: (data: unknown) => void;
};

export type HandshakeReceiverData = WorkerCallbacks & {
  id: string;
  root?: ResourceObject;
  isMessage: (msg: unknown) => boolean;
};

export type HandshakeSenderData = HandshakeReceiverData & {
  handshakeInterval: number;
};

export type HandshakeData = (HandshakeReceiverData | HandshakeSenderData) & {
  type: InterfaceType;
  remoteId: string;
  handshakeTimeout: number;
};

export type HandshakeResponse = {
  id: string;
  root?: ResourceObject;
};

type WIBaseInitConfig = WorkerCallbacks & {
  id?: string;
  root?: unknown;
  remoteId?: string;
  responseTimeout?: number;
  handshakeTimeout?: number;
  handshakeInterval?: number;
};

export type WIInitConfig = WorkerCallbacks &
  WIBaseInitConfig & {
    type: InterfaceType;
  };

export type WIHostConfig = WIBaseInitConfig & {
  worker?: unknown;
};

export type WIWorkerConfig = WIBaseInitConfig & {
  worker?: unknown;
  eventEmitter?: unknown;
  messagePort?: unknown;
};

export type MessageBase = {
  id: string; // every sent message has id, request and its response have same id
  type: MessageType; // message type -- "request" or "response"
  source: string; // sender worker interface id
  target: string; // receiver worker interface id
};

export type RequestMessage = MessageBase & {
  command: ICommand; // request proxy command
  context: unknown; // request command context
};

export type ResponseMessage = MessageBase & {
  value?: unknown; // response value
  error?: { message: string }; // response error
};
