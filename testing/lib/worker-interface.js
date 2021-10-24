import { Worker } from 'worker_threads';
import { handle } from '@actualwave/deferred-data-access';
import { createUIDGenerator } from '@actualwave/deferred-data-access/utils/index.js';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy/index.js';
import {
  getRegistry,
  isResourceObject,
} from '@actualwave/deferred-data-access/resource/index.js';

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
  async (commandChain, context, id = generateMessageId()) => {
    const command = commandChain.toObject();

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
      context,
    };
  };

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

const findEventEmitter = (worker) => {
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

const findMessagePort = (worker) => {
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

const getMessageEventData = (event) => event instanceof Event ? event.data : event;

const handshakeHost =
  ({ id, root, isMessage, subscribe, unsubscribe, postMessage }) =>
  (resolve) => {
    const handshakeHandler = (event) => {
      const data = getMessageEventData(event);

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      postMessage({ id, root });
      resolve(data);
    };

    subscribe(handshakeHandler);
  };

const handshakeWorker =
  ({
    id,
    root,
    isMessage,
    subscribe,
    unsubscribe,
    postMessage,
    handshakeInterval,
  }) =>
  (resolve) => {
    let intervalId;

    const handshakeHandler = (event) => {
      const data = getMessageEventData(event);

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      clearInterval(intervalId);
      resolve(data);
    };

    subscribe(handshakeHandler);

    const intervalFn = () => postMessage({ id, root });

    if (handshakeInterval) {
      intervalId = setInterval(intervalFn, handshakeInterval);
    } else {
      intervalFn();
    }
  };

const handshake = ({ type, remoteId, handshakeTimeout, ...params }) => {
  const fn = type === InterfaceType.HOST ? handshakeHost : handshakeWorker;

  return resolveOrTimeout({
    handler: fn({ isMessage: createIsHandshakeMessage(remoteId), ...params }),
    timeout: handshakeTimeout,
    timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
  });
};

const extractResourceFrom = (value) => {
  if (!isResourceObject(value)) {
    return value;
  }

  const { poolId, id } = value;

  const pool = getRegistry().get(poolId);

  if (!pool) {
    throw new Error(`Resource Pool "${poolId}" does not exist.`);
  }

  const target = pool.getById(id);

  if (!target) {
    throw new Error(`Resource "${id}" does not exist, pool "${poolId}".`);
  }

  return target;
};

const applyRemoteRequest = ({ command: { type, name, value }, context }) => {
  const target = extractResourceFrom(context);

  if (!target) {
    throw new Error(
      `Cannot excute command ${type}/${name} on non existent target(${target}).`
    );
  }

  let result;

  switch (type) {
    case ProxyCommand.GET:
      result = target[name];
      break;
    case ProxyCommand.SET:
      return (target[name] = extractResourceFrom(value));
    case ProxyCommand.DELETE_PROPERTY:
      return delete target[name];
    case ProxyCommand.APPLY:
      const [exeContext, args] = value;
      result = target.apply(
        extractResourceFrom(exeContext),
        args.map(extractResourceFrom)
      );
      break;
    case ProxyCommand.METHOD_CALL:
      result = target[name](...value.map(extractResourceFrom));
      break;
  }

  if (typeof result === 'function') {
    return pool.set(result).toObject();
  }

  return result;
};

const createSubscriberFns = (instance) => {
  if (instance.addEventListener) {
    return {
      subscribe: (listener) => instance.addEventListener(EVENT_TYPE, listener),
      unsubscribe: (listener) =>
        instance.removeEventListener(EVENT_TYPE, listener),
    };
  }

  if (instance.addListener) {
    return {
      subscribe: (listener) => instance.addListener(EVENT_TYPE, listener),
      unsubscribe: (listener) => instance.removeListener(EVENT_TYPE, listener),
    };
  }

  if (instance.on) {
    return {
      subscribe: (listener) => instance.on(EVENT_TYPE, listener),
      unsubscribe: (listener) => instance.off(EVENT_TYPE, listener),
    };
  }

  throw new Error(
    'Worker instance does not implement EventEmitter insterface, ' +
      'it must expose "addEventListener"/"removeEventListener", ' +
      '"addListener"/"removeListener" or ' +
      '"on"/"off" method pair.'
  );
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
  handshakeInterval,
}
  */

export const initialize = async ({ id: initId, root: apiRoot, ...params }) => {
  const id = initId || generateId();
  const root = apiRoot && pool.set(apiRoot).toObject();

  const { subscribe, unsubscribe, postMessage } = params;

  const { id: remoteId, root: remoteRoot } = await handshake({
    id,
    root,
    ...params,
  });

  console.log('HANDSHAKE COMPLETE:', params.type);

  const pendingRequests = new Map(); // {[key: string]: { resolve: (value) => void, reject: (error) => void }}

  const isMessage = createIsMessage(id);
  const createRequest = createRequestMessage(id, remoteId);
  const createResponse = createResponseMessage(id);

  const messageHandler = async (event) => {
    const data = getMessageEventData(event);

    console.log('MESSAGE!::', data);

    if (!isMessage(data)) {
      return;
    }

    switch (data.type) {
      case MessageType.REQUEST:
        try {
          const value = await applyRemoteRequest(data);

          console.log('RETURN RESPONSE:', value, data);

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
    let result = resolveOrTimeout({
      handler: async (resolve, reject) => {
        const request = await createRequest(command, target, id);
        postMessage(request);
        pendingRequests.set(id, { resolve, reject });
      },
      timeout: responseTimeout,
      timeoutError: `Could not receive command ${command.type}/${command.name} response in ${responseTimeout}ms.`,
      onTimeout: () => pendingRequests.delete(id),
    });

    if (isResourceObject(result)) {
      result = wrap(result, command);
    }

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
  worker,
  eventEmitter /*: { addEventListener: unknown }*/ = findEventEmitter(worker),
  messagePort /*: { postMessage: unknown }*/ = findMessagePort(worker),
  ...params
} = {}) =>
  initialize({
    ...params,
    type: InterfaceType.WORKER,
    postMessage: (message) => messagePort.postMessage(message),
    ...createSubscriberFns(eventEmitter),
  });

export const initializeHost = async ({
  worker, //: Worker | string
  ...params
}) => {
  let instance = worker;

  if (typeof worker === 'string') {
    if (typeof Worker === 'undefined') {
      throw new Error('Worker class is not available globally.');
    }

    instance = new Worker(worker);
  }

  return initialize({
    ...params,
    type: InterfaceType.HOST,
    postMessage: (message) => instance.postMessage(message),
    ...createSubscriberFns(instance),
  });
};
