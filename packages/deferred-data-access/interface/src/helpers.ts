const EVENT_TYPE = 'message';

type DataCallback = (data: unknown) => void;

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

export const createSubscriberFns = (
  instance: any,
  eventType = EVENT_TYPE
): {
  subscribe: (fn: DataCallback) => void;
  unsubscribe: (fn: DataCallback) => void;
} => {
  if (instance.addEventListener) {
    return {
      subscribe: (listener: DataCallback) =>
        instance.addEventListener(eventType, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.removeEventListener(eventType, listener),
    };
  }

  if (instance.addListener) {
    return {
      subscribe: (listener: DataCallback) =>
        instance.addListener(eventType, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.removeListener(eventType, listener),
    };
  }

  if (instance.on) {
    return {
      subscribe: (listener: DataCallback) => instance.on(eventType, listener),
      unsubscribe: (listener: DataCallback) =>
        instance.off(eventType, listener),
    };
  }

  throw new Error(
    'Worker instance does not implement EventEmitter insterface, ' +
      'it must expose "addEventListener"/"removeEventListener", ' +
      '"addListener"/"removeListener" or ' +
      '"on"/"off" method pair.'
  );
};
