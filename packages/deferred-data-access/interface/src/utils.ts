import {
  createUIDGenerator,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';
import {
  ProxyCommand,
  unwrapProxy,
  isWrappedWithProxy,
} from '@actualwave/deferred-data-access/proxy';
import { RequestMessage, ResponseMessage } from './types';
import { getPool } from './request';
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
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    const list = [];
    for (const item of value) {
      list.push(await lookupForResource(item));
    }
    return list;
  }

  if (isWrappedWithProxy(value)) {
    const target = await unwrapProxy(value);
    return lookupForResource(target);
  }

  if (typeof value === 'function') {
    const resource = getPool().set(value) as Resource;
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
    id = generateMessageId(),
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
    error?: { message: string },
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
  (data: unknown): boolean => {
    if (data == null || typeof data !== 'object') return false;
    const dataId = (data as Record<string, unknown>).id;
    if (typeof dataId !== 'string') return false;
    return id ? id === dataId : /^wi/.test(dataId);
  };

export const createIsMessage =
  (target: string) =>
  (data: unknown): boolean => {
    if (data == null || typeof data !== 'object') return false;
    const { id, target: dataTarget } = data as Record<string, unknown>;
    return typeof id === 'string' && target === dataTarget;
  };

interface ResolveOrTimeoutConfig<T> {
  handler:
    | Promise<T>
    | ((
        resolve: (data: T) => void,
        reject: (data: unknown) => void,
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

  if (!timeout) {
    return promise;
  }

  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, rej) => {
    timeoutHandle = setTimeout(() => {
      rej(timeoutError);
      // Call onTimeout AFTER rejecting so the race is already settled.
      // This prevents the double-rejection issue in initialize's onTimeout handler.
      onTimeout && onTimeout(timeoutError);
    }, timeout);
  });

  // Clear the timeout if the main promise wins the race
  return Promise.race<T>([
    promise.then(
      (v) => {
        clearTimeout(timeoutHandle);
        return v;
      },
      (e) => {
        clearTimeout(timeoutHandle);
        throw e;
      },
    ),
    timeoutPromise,
  ]);
};

export const getMessageEventData = (event: any) =>
  event != null && typeof event === 'object' && 'data' in event ? event.data : event;
