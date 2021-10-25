import {
  createUIDGenerator,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import { RequestMessage, ResponseMessage } from './types';

const EVENT_TYPE = 'message';

export enum InterfaceType {
  HOST = 'host',
  WORKER = 'worker',
}

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
}

export const generateId = createUIDGenerator('wi');

export const generateMessageId = createUIDGenerator('m');

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
      command.value = [exeContext, command.value];
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
  handler: (
    resolve: (data: T) => void,
    reject?: (data: unknown) => void
  ) => unknown;
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
  const promise = new Promise<T>(handler);

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

export const findEventEmitter = (worker: unknown): unknown => {
  if (worker) {
    return worker;
  }

  if (typeof self === 'object') {
    return self;
  }

  throw new Error(
    'EventEmitter is not defined, please provide EventEmitter interface via "worker" or "eventEmitter" property.'
  );
};

export const findMessagePort = (worker: unknown): unknown => {
  if (worker) {
    return worker;
  }

  if (typeof self === 'object') {
    return self;
  }

  throw new Error(
    'MessagePort is not defined, please provide MessagePort interface via "worker" or "messagePort" property.'
  );
};

export const getMessageEventData = (event: any) =>
  event instanceof Event ? (event as Event & { data: any }).data : event;

type DataCallback = (data: unknown) => void;

export const createSubscriberFns = (
  instance: any
): {
  subscribe: (fn: DataCallback) => void;
  unsubscribe: (fn: DataCallback) => void;
} => {
  if (instance.addEventListener) {
    return {
      subscribe: (listener: DataCallback) =>
        instance.addEventListener(EVENT_TYPE, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.removeEventListener(EVENT_TYPE, listener),
    };
  }

  if (instance.addListener) {
    return {
      subscribe: (listener: DataCallback) =>
        instance.addListener(EVENT_TYPE, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.removeListener(EVENT_TYPE, listener),
    };
  }

  if (instance.on) {
    return {
      subscribe: (listener: DataCallback) => instance.on(EVENT_TYPE, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.off(EVENT_TYPE, listener),
    };
  }

  throw new Error(
    'Worker instance does not implement EventEmitter insterface, ' +
      'it must expose "addEventListener"/"removeEventListener", ' +
      '"addListener"/"removeListener" or ' +
      '"on"/"off" method pair.'
  );
};
