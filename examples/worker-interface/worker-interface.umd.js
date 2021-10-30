(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory((global.WorkerInterface = {})));
})(this, function (exports) {
  'use strict';

  const DATE_NOW = Date.now() - Math.floor(Math.random() * 1000);
  let index = 0;
  var ReservedPropertyNames;
  (function (ReservedPropertyNames) {
    ReservedPropertyNames['THEN'] = 'then';
    ReservedPropertyNames['CATCH'] = 'catch';
  })(ReservedPropertyNames || (ReservedPropertyNames = {}));
  const isReservedPropertyName = (name) =>
    name === ReservedPropertyNames.THEN || name === ReservedPropertyNames.CATCH;
  const createUIDGenerator = (key = '') => {
    const prefix = `${key ? `${key}/` : ''}${DATE_NOW}/`;
    return () => `${prefix}${++index};`;
  };
  const generateId$1 = createUIDGenerator();
  class IdOwner {
    constructor(id = generateId$1()) {
      this.id = id;
    }
  }

  class Command {
    constructor(type, name, value, context) {
      this.type = type;
      this.name = name;
      this.value = value;
      this.context = context;
    }
    toObject(includeContext = false) {
      const { type, name, value, context } = this;
      return {
        type,
        name,
        value,
        context: includeContext ? context : undefined,
      };
    }
    toJSON(includeContext = false) {
      const { type, name, value, context } = this;
      return JSON.stringify([
        type,
        name,
        value,
        includeContext ? context : undefined,
      ]);
    }
    static fromJSON(jsonString) {
      const [type, name, value, context] = JSON.parse(jsonString);
      return new Command(type, name, value, context);
    }
  }

  class CommandChain extends Command {
    constructor(prev, type, name, value, context) {
      super(type, name, value, context);
      this.prev = prev;
    }
    *[Symbol.iterator]() {
      let item = this;
      while (item) {
        yield item;
        item = item.prev;
      }
    }
    isTail() {
      return !this.prev;
    }
    forEach(callback) {
      let node = this;
      do {
        callback(node);
        node = node.prev;
      } while (node);
    }
    map(callback) {
      let node = this;
      const list = [];
      do {
        list.push(callback(node));
        node = node.prev;
      } while (node);
      return list;
    }
    reduce(callback, base) {
      let node = this;
      let result = base;
      do {
        result = callback(result, node);
        node = node.prev;
      } while (node);
      return result;
    }
    static fromCommand({ type, name, value, context }, prev) {
      return new CommandChain(prev, type, name, value, context);
    }
  }

  var ProxyCommand;
  (function (ProxyCommand) {
    ProxyCommand['GET'] = 'P:get';
    ProxyCommand['SET'] = 'P:set';
    ProxyCommand['APPLY'] = 'P:apply';
    ProxyCommand['DELETE_PROPERTY'] = 'P:del';
    // If proxy works in lazy mode and APPLY command has previous GET command, this will be generated.
    ProxyCommand['METHOD_CALL'] = 'P:call';
  })(ProxyCommand || (ProxyCommand = {}));
  const generateProxyCommand = (head, type, name, value, context, lazy) => {
    if (
      type === ProxyCommand.APPLY &&
      lazy &&
      head?.type === ProxyCommand.GET
    ) {
      return new CommandChain(
        head.prev,
        ProxyCommand.METHOD_CALL,
        head.name,
        value,
        head.context
      );
    }
    return new CommandChain(head, type, name, value, context);
  };

  const EXCLUSIONS = {
    /*
         INFO arguments and caller were included because they are required function properties
         https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments
         */
    arguments: true,
    caller: true,
    prototype: true,
  };
  const API_PROP = Symbol('P:api');

  const wrapWithProxy = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target,
    traps,
    api = {}
  ) => {
    const wrapper = Object.assign(
      typeof target === 'function'
        ? function $RequestFn(...args) {
            return target.apply(this, args);
          }
        : function $Request() {
            // because
          },
      {
        target,
        [API_PROP]: { getTarget: () => target, ...api },
      }
    );
    return new Proxy(wrapper, traps);
  };

  const hasOwn = (
    (has) => (target, property) =>
      Boolean(target && has.call(target, property))
  )(Object.prototype.hasOwnProperty);

  const isNameExcluded = (name) =>
    name === API_PROP || hasOwn(EXCLUSIONS, name);

  const createGetTrap = (handler) => (wrapper, name) => {
    const { target } = wrapper;
    if (isNameExcluded(name)) {
      return wrapper[name];
    }
    // We expect that user of the lib will wrap with Proxy explicitly whatever they want
    return handler(ProxyCommand.GET, name, undefined, target);
  };
  const createApplyTrap =
    (handler) =>
    ({ target }, thisValue, args) => {
      // thisValue is being ignored for now
      // target is a function that should be applied
      return handler(ProxyCommand.APPLY, undefined, args, target);
    };
  const createSetTrap =
    (handler) =>
    ({ target }, name, value) => {
      if (isNameExcluded(name)) {
        return false;
      }
      /* TODO why this might be needed?
        if (isNameSymbol(name)) {
          target.then((context: any) => {
            context[name] = value;
          });

          return false;
        }
        */
      handler(ProxyCommand.SET, name, value, target);
      return true;
    };
  const createDeletePropertyTrap = (handler) => (wrapper, name) => {
    if (isNameExcluded(name)) {
      return false;
    }
    handler(ProxyCommand.DELETE_PROPERTY, name, undefined, wrapper.target);
    return true;
  };
  const proxyHasTrap = (wrapper, name) => {
    if (isNameExcluded(name)) {
      return wrapper[name];
    }
    return false;
  };
  const proxyOwnKeysTrap = () => Object.getOwnPropertyNames(EXCLUSIONS);
  // INFO You cannot enumerate properties of request object, this may possibly require processing a lot of data
  const proxyEnumerateTrap = () =>
    Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();
  const proxyGetOwnPropertyDescriptorTrap = (wrapper, name) => {
    if (isNameExcluded(name)) {
      return Object.getOwnPropertyDescriptor(wrapper, name);
    }
    return Object.getOwnPropertyDescriptor(wrapper.target, name);
  };
  const createProxyTrapsObject = (handler) => ({
    get: createGetTrap(handler),
    apply: createApplyTrap(handler),
    set: createSetTrap(handler),
    deleteProperty: createDeletePropertyTrap(handler),
    has: proxyHasTrap,
    ownKeys: proxyOwnKeysTrap,
    enumerate: proxyEnumerateTrap,
    getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptorTrap,
  });

  const EMPTY_PROMISE = Promise.resolve(undefined);
  const isPromiseActivity = (command) => {
    const { type } = command;
    if (type === ProxyCommand.GET || type === ProxyCommand.METHOD_CALL) {
      return isReservedPropertyName(command.name);
    }
    if (type === ProxyCommand.APPLY) {
      return isReservedPropertyName(command.prev?.name);
    }
    return false;
  };
  const executePromiseMethod = (context, name, args) => {
    switch (name) {
      case ReservedPropertyNames.THEN:
        return context.then(...args);
      case ReservedPropertyNames.CATCH:
        return context.catch(...args);
      default:
        throw new Error(
          `Unexpected Error: Promise method "${String(
            name
          )}" could not be called.`
        );
    }
  };
  const applyPromiseActivity = (command, commandHandler, lazy, wrap) => {
    switch (command.type) {
      case ProxyCommand.GET: {
        const { name, prev } = command;
        let { context } = command;
        if (lazy) {
          // then() / catch() on lazy means we should call handler and subscribe to promise
          if (!prev) {
            throw new Error(
              `Unexpected Error: Proxy command GET has unknown context.`
            );
          }
          // When lazy, context is a dummy promise, so we have to call handler with previous command and then use it as a context.
          context = commandHandler(prev, prev.context, wrap);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args) => context[name](...args);
      }
      case ProxyCommand.METHOD_CALL:
        if (!command.context) {
          throw new Error(
            `Unexpected Error: Could not apply Promise method of unknown context.`
          );
        }
        return executePromiseMethod(
          command.context,
          command.name,
          command.value
        );
      case ProxyCommand.APPLY: {
        const { prev } = command;
        if (!prev?.context || !prev?.name) {
          throw new Error(
            `Unexpected Error: Could not apply Promise method of unknown context.`
          );
        }
        return executePromiseMethod(prev.context, prev.name, command.value);
      }
      default:
        throw new Error(
          `Command type "${command.type}" could not be executed as a Promise command.`
        );
    }
  };
  const handle =
    (commandHandler, lazy = true) =>
    (context, command) => {
      const wrap = (context, command) => {
        const traps = createProxyTrapsObject((type, name, value, context) => {
          const childCommand = generateProxyCommand(
            command,
            type,
            name,
            value,
            context,
            lazy
          );
          let result;
          if (isPromiseActivity(childCommand)) {
            return applyPromiseActivity(
              childCommand,
              commandHandler,
              lazy,
              wrap
            );
          } else if (
            (type === ProxyCommand.APPLY || type === ProxyCommand.GET) &&
            lazy
          ) {
            result = EMPTY_PROMISE;
          } else {
            result = commandHandler(childCommand, context, wrap);
          }
          // anything coming not from Promise methods is always wrapped
          return wrap(result, childCommand);
        });
        return wrapWithProxy(context, traps, {
          getCommand() {
            return command;
          },
          dropCommandChain() {
            if (command) {
              delete command.prev;
            }
          },
        });
      };
      return wrap(
        Promise.resolve(context),
        command ? CommandChain.fromCommand(command) : undefined
      );
    };

  class KeysIterator {
    constructor(map) {
      this.map = map;
      this.mapIterator = this.map.keys();
    }
    [Symbol.iterator]() {
      return new KeysIterator(this.map);
    }
    next() {
      let key;
      let value;
      let done;
      do {
        ({ done, value: key } = this.mapIterator.next());
        if (!done) {
          value = this.map.get(key).deref();
        }
      } while (!done && !value);
      return {
        done,
        value: key,
      };
    }
  }

  class ValuesIterator {
    constructor(mapIterator) {
      this.mapIterator = mapIterator;
    }
    [Symbol.iterator]() {
      return new ValuesIterator(this.mapIterator[Symbol.iterator]());
    }
    next() {
      let ref;
      let value;
      let done;
      do {
        ({ done, value: ref } = this.mapIterator.next());
        if (done) {
          value = undefined;
        } else {
          value = ref.deref();
        }
      } while (!done && !value);
      return {
        done,
        value,
      };
    }
  }

  class EntriesIterator {
    constructor(mapIterator) {
      this.mapIterator = mapIterator;
    }
    [Symbol.iterator]() {
      return new EntriesIterator(this.mapIterator[Symbol.iterator]());
    }
    next() {
      let entries;
      let value;
      let done;
      do {
        ({ done, value: entries } = this.mapIterator.next());
        if (done) {
          entries = undefined;
        } else {
          value = entries[1].deref();
          entries = [entries[0], value];
        }
      } while (!done && !value);
      return {
        done,
        entries,
      };
    }
  }

  class WeakValueMap {
    constructor(autoVerify = true) {
      this.map = new Map();
      if (autoVerify) {
        this.finalizer = new FinalizationRegistry((key) => {
          const ref = this.map.get(key);
          if (!ref || !ref.deref()) {
            this.map.delete(key);
          }
        });
      }
    }
    get size() {
      return this.map.size;
    }
    keys() {
      return new KeysIterator(this.map);
    }
    values() {
      return new ValuesIterator(this.map.values());
    }
    entries() {
      return new EntriesIterator(this.map.entries());
    }
    set(key, value) {
      this.map.set(key, new WeakRef(value));
    }
    get(key) {
      const ref = this.map.get(key);
      return ref && ref.deref();
    }
    has(key) {
      return !!this.get(key);
    }
    delete(key) {
      return this.map.delete(key);
    }
    clear() {
      this.map.clear();
    }
    forEach(callback) {
      this.map.forEach((ref, key) => {
        const value = ref.deref();
        if (value) {
          callback(value, key, this);
        }
      });
    }
    verify() {
      const map = new Map();
      this.map.forEach((ref, key) => {
        const value = ref.deref();
        if (value) {
          map.set(key, ref);
        }
      });
      this.map.clear();
      this.map = map;
    }
  }

  class Resource extends IdOwner {
    constructor(pool, type) {
      super();
      this.pool = pool;
      this.type = type;
    }
    toObject() {
      return { id: this.id, poolId: this.pool.id, type: this.type };
    }
    toJSON() {
      return JSON.stringify(this.toObject());
    }
  }
  const createResource = (pool, target, type) =>
    new Resource(pool, type || typeof target);
  const isResourceObject = (obj) =>
    obj &&
    // type signature is not enough for non-ts env
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.poolId === 'string';

  const validTargets = new Set();
  const getDefaultValidTargets = () => ['object', 'function'];
  const isValidTarget = (value) => validTargets.has(typeof value);
  const setValidTargets = (list) => {
    validTargets.clear();
    list.forEach((item) => validTargets.add(item));
  };
  setValidTargets(getDefaultValidTargets());

  /* eslint-disable @typescript-eslint/ban-types */
  class ResourcePool extends IdOwner {
    constructor() {
      super(...arguments);
      // { [string]: weakref }
      this.refs = new WeakValueMap();
      // { [weakref]: Resource }
      this.resources = new WeakMap();
    }
    get active() {
      return !!this.resources;
    }
    set(target, type) {
      let resource = null;
      if (!isValidTarget(target)) {
        return resource;
      }
      resource = this.resources.get(target);
      if (!resource) {
        resource = createResource(this, target, type);
        this.refs.set(resource.id, target);
        this.resources.set(target, resource);
      }
      return resource;
    }
    has(target) {
      return this.resources.has(target);
    }
    get({ id }) {
      return this.getById(id);
    }
    getById(id) {
      return this.refs.get(id);
    }
    getResource(target) {
      return this.resources.get(target);
    }
    remove(target) {
      const resource = this.resources.get(target);
      if (resource) {
        this.refs.delete(resource.id);
        return this.resources.delete(target);
      }
      return false;
    }
    clear() {
      for (const key of this.refs.keys()) {
        const target = this.refs.get(key);
        this.resources.delete(target);
      }
      this.refs.clear();
    }
  }

  const generateGetDefaultResourcePool = (pool) => () => {
    if (!pool) {
      pool = new ResourcePool();
    }
    return pool;
  };
  const getDefaultResourcePool = generateGetDefaultResourcePool();

  class ResourcePoolRegistry extends IdOwner {
    constructor() {
      super();
      this.pools = {};
      this.register(getDefaultResourcePool());
    }
    /**
     * Create and register ResourcePool
     */
    createPool() {
      const pool = new ResourcePool();
      this.register(pool);
      return pool;
    }
    /**
     * Register ResourcePool instance.
     */
    register(pool) {
      if (hasOwn(this.pools, pool.id)) return false;
      this.pools[pool.id] = pool;
      return true;
    }
    /**
     * Retrieve ResourcePool instance from registry by its Id.
     */
    get(poolId) {
      return this.pools[poolId] || null;
    }
    /**
     * Check if ResourcePool registered in this registry instance.
     */
    isRegistered(pool) {
      return hasOwn(this.pools, pool.id);
    }
    /**
     * Remove ResourcePool from current registry instance.
     */
    remove(pool) {
      const poolId = typeof pool === 'string' ? pool : pool.id;
      return delete this.pools[poolId];
    }
  }
  const generateGetRegistry = (registry) => () => {
    if (!registry) {
      registry = new ResourcePoolRegistry();
    }
    return registry;
  };
  const getRegistry = generateGetRegistry();

  const EVENT_TYPE = 'message';
  var InterfaceType;
  (function (InterfaceType) {
    InterfaceType['HOST'] = 'host';
    InterfaceType['WORKER'] = 'worker';
  })(InterfaceType || (InterfaceType = {}));
  var MessageType;
  (function (MessageType) {
    MessageType['REQUEST'] = 'request';
    MessageType['RESPONSE'] = 'response';
  })(MessageType || (MessageType = {}));
  const generateId = createUIDGenerator('wi');
  const generateMessageId = createUIDGenerator('m');

  const isWrappedWithProxy = (obj) => !!(obj && obj[API_PROP]);

  const unwrapProxy = (obj) =>
    (obj && obj[API_PROP] && obj[API_PROP].getTarget()) || obj;

  const lookupForResource = async (value) => {
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
      const resource = pool.set(value);
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
  const createRequestMessage =
    (source, target) =>
    async (commandChain, context, id = generateMessageId()) => {
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
  const createResponseMessage =
    (source) =>
    // with "undefined" value, "error" key will not be packed into JSON, less bytes sent
    ({ id, source: target }, value, error) => ({
      id,
      type: MessageType.RESPONSE,
      source,
      target,
      value,
      error,
    });
  const createIsHandshakeMessage =
    (id = '') =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data) =>
      data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      ((!id && data.id.match(/^wi/)) || (id && id === data.id));
  const createIsMessage =
    (target) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data) =>
      data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      target === data.target;
  const resolveOrTimeout = ({
    handler,
    timeout,
    timeoutError = `Async operation didn't complete in ${timeout}ms.`,
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
  const getMessageEventData = (event) =>
    event instanceof Event ? event.data : event;
  const createSubscriberFns = (instance) => {
    if (instance.addEventListener) {
      return {
        subscribe: (listener) =>
          instance.addEventListener(EVENT_TYPE, listener),
        unsubscribe: (listener) =>
          instance.removeEventListener(EVENT_TYPE, listener),
      };
    }
    if (instance.addListener) {
      return {
        subscribe: (listener) => instance.addListener(EVENT_TYPE, listener),
        unsubscribe: (listener) =>
          instance.removeListener(EVENT_TYPE, listener),
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
        // FIXME TS2322: Type 'Timer' is not assignable to type 'number'.
        intervalId = setInterval(intervalFn, handshakeInterval);
      } else {
        intervalFn();
      }
    };
  const handshake = ({ type, remoteId, handshakeTimeout, ...params }) => {
    const data = {
      ...params,
      isMessage: createIsHandshakeMessage(remoteId),
    };
    const handler =
      type === InterfaceType.HOST ? handshakeHost(data) : handshakeWorker(data);
    return resolveOrTimeout({
      handler,
      timeout: handshakeTimeout,
      timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
    });
  };

  ///<reference path="../../../typings/@actualwave/deferred-data-access/utils/index.d.ts" />
  const registry = getRegistry();
  const pool = registry.createPool();
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
  const applyRemoteRequest = ({
    command,
    command: { type, value },
    context,
  }) => {
    const target = extractResourceFrom(context);
    const name = command.name;
    if (!target) {
      throw new Error(
        `Cannot excute command ${type}/${String(
          name
        )} on non existent target(${target}).`
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
        {
          const [exeContext, args] = value;
          result = target.apply(
            extractResourceFrom(exeContext),
            args.map(extractResourceFrom)
          );
        }
        break;
      case ProxyCommand.METHOD_CALL:
        result = target[name](...value.map(extractResourceFrom));
        break;
    }
    if (result && typeof result === 'function') {
      const resource = pool.set(result);
      return resource.toObject();
    }
    return result;
  };

  /*
    {
      id,
      type,
      root,
      remoteId, // we might expect a connection with matching ID
      subscribe,
      unsubscribe,
      postMessage,
      handshakeTimeout,
      responseTimeout,
      handshakeInterval,
    }
      */
  const initialize = async ({ id: initId, root: apiRoot, ...params }) => {
    const id = initId || generateId();
    const root = apiRoot ? pool.set(apiRoot).toObject() : undefined;
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
    const messageHandler = async (event) => {
      const data = getMessageEventData(event);
      if (!isMessage(data)) {
        return;
      }
      switch (data.type) {
        case MessageType.REQUEST:
          {
            const request = data;
            try {
              const value = await applyRemoteRequest(request);
              postMessage(createResponse(request, value));
            } catch (error) {
              postMessage(
                createResponse(request, undefined, { message: error.message })
              );
            }
          }
          break;
        case MessageType.RESPONSE:
          {
            const { id, value, error } = data;
            const { resolve, reject } = pendingRequests.get(id) || {};
            // if error present call reject, if not -- call resolve
            if (reject && error) {
              reject(error);
            } else if (resolve) {
              resolve(value);
            }
          }
          break;
      }
    };
    subscribe(messageHandler);
    const stop = () => unsubscribe(messageHandler);
    if (!remoteRoot) {
      return { stop, pool };
    }
    const wrap = handle(
      async (
        command,
        context,
        // wrap() is a partially applied handle(), so it makes possible to apply same command handlers to other objects
        wrap
      ) => {
        const { responseTimeout } = params;
        /*
            If target is not a resource, there are no need to send command to remote, it can be resolved immediately.
            Need to know if there will be such cases.
          */
        const id = generateMessageId();
        const timeoutError = `Could not receive command ${
          command.type
        }/${String(command.name)} response in ${responseTimeout}ms.`;
        const resultPromise = resolveOrTimeout({
          handler: async (resolve, reject) => {
            const request = await createRequest(command, context, id);
            console.log(request);
            postMessage(request);
            pendingRequests.set(id, { resolve, reject });
          },
          timeout: responseTimeout || 0,
          timeoutError,
          onTimeout: () => {
            const rq = pendingRequests.get(id);
            if (!rq) {
              return;
            }
            rq.reject(new Error(timeoutError));
            pendingRequests.delete(id);
          },
        });
        const result = await resultPromise;
        if (isResourceObject(result)) {
          return wrap(resultPromise, command);
        }
        return resultPromise;
      },
      false
    );
    return {
      stop,
      pool,
      wrap,
      pendingRequests,
      root: remoteRoot ? wrap(remoteRoot) : null,
    };
  };
  const initializeWorker = async ({
    worker,
    eventEmitter = findEventEmitter(worker),
    messagePort = findMessagePort(worker),
    ...params
  }) =>
    initialize({
      ...params,
      type: InterfaceType.WORKER,
      postMessage: (message) => messagePort.postMessage(message),
      ...createSubscriberFns(eventEmitter),
    });
  const initializeHost = async ({
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

  exports.initialize = initialize;
  exports.initializeHost = initializeHost;
  exports.initializeWorker = initializeWorker;

  Object.defineProperty(exports, '__esModule', { value: true });
});
//# sourceMappingURL=worker-interface.umd.js.map
