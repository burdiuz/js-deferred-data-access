import { Worker } from 'worker_threads';
import { handle } from '@actualwave/deferred-data-access';
import {
  createUIDGenerator,
  isResource,
} from '@actualwave/deferred-data-access/utils/index.js';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy/index.js';
import { getRegistry } from '@actualwave/deferred-data-access/resource/index.js';

const registry = getRegistry();
const pool = registry.createPool();

const EVENT_TYPE = 'message';

const InterfaceType = {
  HOST: 'host',
  WORKER: 'worker',
};

const MessageType = {
  REQUEST: 'request',
  RESPONSE: 'response',
};

const generateId = createUIDGenerator('wi');

const generateMessageId = createUIDGenerator('m');

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

const createRequestMessage =
  (source, target) =>
  (command, context, id = generateMessageId()) => ({
    id,
    type: MessageType.REQUEST,
    source,
    target,
    command,
    context,
  });

const createResponseMessage =
  (source) =>
  // with "undefined" value, "error" key will not be packed into JSON, less bytes sent
  ({ id, source: target }, value, error = undefined) => ({
    id,
    type: MessageType.RESPONSE,
    source,
    target,
    value,
    error,
  });

const createIsHandshakeMessage =
  (id = '') =>
  (data) =>
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    ((!id && data.id.match(/^wi/)) || (id && id === data.id));

const createIsMessage = (target) => (data) =>
  data &&
  typeof data === 'object' &&
  typeof data.id === 'string' &&
  target === data.target;

const resolveOrTimeout = ({
  handler,
  timeout,
  timeoutError = `Async operation didn\'t complete in ${timeout}ms.`,
  onTimeout,
}) => {
  const promise = new Promise(handler);

  return timeout
    ? Promise.race([
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

const findEventEmitter = () => {
  if (typeof self === 'object') {
    return self;
  }

  return global;
};

const findMessagePort = () => {
  if (typeof self === 'object') {
    return self;
  }

  if (typeof globalThis === 'object') {
    return globalThis;
  }
};

const handshakeHost = ({
  id,
  root,
  isMessage,
  subscribe,
  unsubscribe,
  postMessage,
}) =>
  new Promise((resolve) => {
    const handshakeHandler = ({ data }) => {
      if (!isMessage) {
        return;
      }

      unsubscribe(handshakeHandler);
      postMessage({ id, root });
      resolve(data);
    };

    subscribe(handshakeHandler);
  });

const handshakeWorker = ({
  id,
  root,
  isMessage,
  subscribe,
  unsubscribe,
  postMessage,
}) =>
  new Promise((resolve) => {
    let intervalId;

    const handshakeHandler = ({ data }) => {
      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      clearInterval(intervalId);
      resolve(data);
    };

    subscribe(handshakeHandler);
    intervalId = setInterval(() => postMessage({ id, root }), 100);
  });

const handshake = ({ type, remoteId, handshakeTimeout, ...params }) => {
  const fn = type === InterfaceType.HOST ? handshakeHost : handshakeWorker;

  return resolveOrTimeout({
    handler: fn({ isMessage: createIsHandshakeMessage(remoteId), ...params }),
    timeout: handshakeTimeout,
    timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
  });
};

const applyRemoteRequest = ({ command: { type, name, value }, context }) => {
  let target = context;

  if (isResource(context)) {
    const { poolId, id } = context;

    const pool = getRegistry().get(poolId);

    if (pool) {
      target = pool.get(id);

      if (!target) {
        throw new Error(`Resource "${id}" does not exist, pool "${poolId}".`);
      }
    } else {
      throw new Error(`Resource Pool "${poolId}" does not exist.`);
    }
  }

  if (!target) {
    throw new Error(
      `Cannot excute command ${type}/${name} on non existent target(${target}).`
    );
  }

  switch (type) {
    case ProxyCommand.GET:
      return target[name];
    case ProxyCommand.SET:
      return (target[name] = value);
    case ProxyCommand.DELETE_PROPERTY:
      return delete target[name];
    case ProxyCommand.APPLY:
      return target(...value);
    case ProxyCommand.METHOD_CALL:
      return target[name](...value);
  }
};

/*
{
  id,
  type,
  api,
  remoteId, // we might expect a connection with matching ID
  subscribe,
  unsubscribe,
  postMessage,
  handshakeTimeout,
  responseTimeout,
}
  */

export const initialize = async ({ id: initId, api, ...params }) => {
  const id = initId || generateId();
  const root = pool.set(api);

  const { subscribe, unsubscribe, postMessage } = params;

  const { id: remoteId, root: remoteRoot } = await handshake({
    id,
    root,
    ...params,
  });

  const pendingRequests = new Map(); // {[key: string]: { resolve: (value) => void, reject: (error) => void }}

  const isMessage = createIsMessage(id);
  const createRequest = createRequestMessage(id, remoteId);
  const createResponse = createResponseMessage(id);

  const messageHandler = ({ data }) => {
    if (!isMessage(data)) {
      return;
    }

    switch (data.type) {
      case MessageType.REQUEST:
        try {
          const value = await applyRemoteRequest(data);

          postMessage(createResponse(data, value));
        } catch (error) {
          postMessage(createResponse(data, undefined, error));
        }
        break;
      case MessageType.RESPONSE:
        const { id, value, error } = data;
        const { resolve, reject } = pendingRequests.get(id) || {};

        // if error present call reject, if not -- call resolve
        if (reject && error) {
          reject(error);
        } else if (resolve) {
          resolve(value);
        }
        break;
    }
  };

  subscribe(messageHandler);
  const stop = () => unsubscribe(messageHandler);

  if (!remoteRoot) {
    return { stop, pool };
  }

  const wrap = handle(async (command, context, wrap) => {
    const { responseTimeout } = params;
    const target = await context;

    /*
      If target is not a resource, there are no need to send command to remote, it can be resolved immediately.
      Need to know if there will be such cases.
    */

    const id = generateMessageId();
    const result = resolveOrTimeout({
      handler: (resolve, reject) => {
        createRequest(command, target, id);
        pendingRequests.set(id, { resolve, reject });
      },
      timeout: responseTimeout,
      timeoutError: `Could not receive command ${command.type}/${command.name} response in ${responseTimeout}ms.`,
      onTimeout: () => pendingRequests.delete(id),
    });

    return result;
  }, false);

  return {
    stop,
    pool,
    wrap,
    pendingRequests,
    root: remoteRoot ? wrap(remoteRoot) : null,
  };
};

export const initializeWorker = async ({
  eventEmitter /*: { addEventListener: unknown }*/ = findEventEmitter(),
  messagePort /*: { postMessage: unknown }*/ = findMessagePort(),
  ...params
}) =>
  initialize({
    ...params,
    type: InterfaceType.WORKER,
    subscribe: (listener) =>
      eventEmitter.addEventListener(EVENT_TYPE, listener),
    unsubscribe: (listener) =>
      eventEmitter.removeEventListener(EVENT_TYPE, listener),
    postMessage: (message) => messagePort.postMessage(message),
  });

export const initializeHost = async ({
  worker, //: Worker | string
  ...params
}) => {
  const instance = typeof worker === 'string' ? new Worker(worker) : worker;

  return initialize({
    ...params,
    type: InterfaceType.HOST,
    subscribe: (listener) => instance.addEventListener(EVENT_TYPE, listener),
    unsubscribe: (listener) =>
      instance.removeEventListener(EVENT_TYPE, listener),
    postMessage: (message) => instance.postMessage(message),
  });
};
