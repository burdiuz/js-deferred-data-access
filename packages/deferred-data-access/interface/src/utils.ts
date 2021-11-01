import {
  createUIDGenerator,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';
import {
  ProxyCommand,
  unwrapProxy,
} from '@actualwave/deferred-data-access/proxy';
import { RequestMessage, ResponseMessage } from './types';
import { isWrappedWithProxy } from '@actualwave/deferred-data-access/proxy';
import { pool } from './request';
import { Resource } from '@actualwave/deferred-data-access/resource';

export enum InterfaceType {
  HOST = 'host',
  GUEST = 'guest',
}

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
}

export const generateId = createUIDGenerator('wi');

export const generateMessageId = createUIDGenerator('m');

const lookupForResource = async (value: unknown): Promise<unknown> => {
  if (!value) {
    return value;
  }

  if (value instanceof Array) {
    const list = [];
    for (let item of value) {
      list.push(await lookupForResource(item));
    }
    return list;
  }

  if (isWrappedWithProxy(value)) {
    const target = await unwrapProxy(value);
    return lookupForResource(target);
  }

  if (typeof value === 'function') {
    const resource = pool.set(value) as Resource;
    return resource.toObject();
  }

  return value;
};

/*
Message signature

{ 
  id, // every sent message has id, request and its response have same id
  type, // message type -- "request" or "response"
  source, // sender worker interface id
  target, // receiver worker interface id
  command, // request proxy command
  context, // request command context
  value, // response value
  error, // response error
}
*/

export const createRequestMessage =
  (source: string, target: string) =>
  async (
    commandChain: ICommandList,
    context?: Promise<unknown>,
    id = generateMessageId()
  ): Promise<RequestMessage> => {
    const command = commandChain.toObject();
    const contextTarget = await context;

    // apply function to owner object
    if (command.type === ProxyCommand.APPLY) {
      let exeContext;

      if (commandChain.prev) {
        exeContext = await commandChain.prev.context;
      }

      // prepare arguments for Function.apply()
      command.value = [exeContext, await lookupForResource(command.value)];
    } else {
      command.value = await lookupForResource(command.value);
    }

    return {
      id,
      type: MessageType.REQUEST,
      source,
      target,
      command,
      context: contextTarget,
    };
  };

export const createResponseMessage =
  (source: string) =>
  // with "undefined" value, "error" key will not be packed into JSON, less bytes sent
  (
    { id, source: target }: RequestMessage,
    value: unknown,
    error?: { message: string }
  ): ResponseMessage => ({
    id,
    type: MessageType.RESPONSE,
    source,
    target,
    value,
    error,
  });

export const createIsHandshakeMessage =
  (id = '') =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data: any): boolean =>
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    ((!id && data.id.match(/^wi/)) || (id && id === data.id));

export const createIsMessage =
  (target: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data: any): boolean =>
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    target === data.target;

interface ResolveOrTimeoutConfig<T> {
  handler:
    | Promise<T>
    | ((
        resolve: (data: T) => void,
        reject: (data: unknown) => void
      ) => unknown);
  timeout: number;
  timeoutError: string;
  onTimeout?: (msg: string) => void;
}

export const resolveOrTimeout = <T>({
  handler,
  timeout,
  timeoutError = `Async operation didn't complete in ${timeout}ms.`,
  onTimeout,
}: ResolveOrTimeoutConfig<T>): Promise<T> => {
  const promise =
    typeof handler === 'function' ? new Promise<T>(handler) : handler;

  return timeout
    ? Promise.race<Promise<T>>([
        promise,
        new Promise((_, rej) =>
          setTimeout(() => {
            rej(timeoutError);
            onTimeout && onTimeout(timeoutError);
          }, timeout)
        ),
      ])
    : promise;
};

export const getMessageEventData = (event: any) =>
  event instanceof Event ? (event as Event & { data: any }).data : event;
