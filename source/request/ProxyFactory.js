import Factory, { NO_INIT, createRequestFactory } from './Factory';
import { ProxyCommandFields } from '../command/internal/ProxyCommands';

const EXCLUSIONS = {
  /*
   INFO arguments and caller were included because they are required function properties
   */
  arguments: true,
  caller: true,
  prototype: true,
};

const createFunctionWrapper = (target) => {
  // INFO Target must be a function so I could use Proxy.call() interceptor.
  function requestTargetProxy() {
  }

  requestTargetProxy.target = target;

  return requestTargetProxy;
};

const wrapWithProxy = (target, handlers) => new Proxy(createFunctionWrapper(target), handlers);

const proxyGet = (wrapper, name) => {
  const { target } = wrapper;
  if (name in target || name in EXCLUSIONS || typeof name === 'symbol') {
    return target[name];
  }
  // INFO Proxy should be already applied, so no need in additional wrapping
  return target[ProxyCommandFields.get](name);
};

// INFO Proxy should be already applied, so no need in additional wrapping
const proxyApply = (wrapper, thisValue, args) => (
  wrapper.target[ProxyCommandFields.apply](null, args)
);

const proxySet = (wrapper, name, value) => {
  const { target } = wrapper;

  if (name in target || name in EXCLUSIONS || typeof name === 'symbol') {
    target[name] = value;
    return value;
  }

  if (ProxyCommandFields.set in target) {
    target[ProxyCommandFields.set](name, value);
    return true;
  }

  return false;
};

const proxyHas = (wrapper, name) => (
  Object.prototype.hasOwnProperty.call(wrapper.target, name)
);

const proxyDeleteProperty = (wrapper, name) => {
  const { target } = wrapper;
  if (ProxyCommandFields.deleteProperty in target) {
    target[ProxyCommandFields.deleteProperty](name);
    return true;
  }

  return false;
};

const proxyOwnKeys = (wrapper) => {
  const { target } = wrapper;
  return [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertyNames(EXCLUSIONS)];
};

const proxyEnumerate = (wrapper) => {
  const { target } = wrapper;
  return [
    ...Object.getOwnPropertyNames(target),
    ...Object.getOwnPropertyNames(EXCLUSIONS),
  ][Symbol.iterator]();
};

const proxyGetOwnPropertyDescriptor = (wrapper, name) => {
  if (Object.prototype.hasOwnProperty.call(EXCLUSIONS, name)) {
    return Object.getOwnPropertyDescriptor(wrapper, name);
  }
  return Object.getOwnPropertyDescriptor(wrapper.target, name);
};

/**
 * Builds proper handlers hash for Proxy
 * @returns {Function}
 */
export const createProxyHandlers = (handlers = {}) => ({
  get: proxyGet,
  apply: proxyApply,
  set: proxySet,
  has: proxyHas,
  deleteProperty: proxyDeleteProperty,
  ownKeys: proxyOwnKeys,
  enumerate: proxyEnumerate,
  getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptor,
  ...handlers,
});

const PROXY_HANDLERS = createProxyHandlers();

class ProxyFactory extends Factory {
  constructor(handlers, cacheImpl) {
    super(NO_INIT);

    this.handlers = handlers;
    this.factory = createRequestFactory(handlers, cacheImpl);
    this.factory.decorator.setFactory(this);
  }

  create(promise, name = null, pack = null, cacheable = false) {
    const instance = this.factory.create(promise, name, pack, cacheable);

    if (this.handlers.available) {
      return wrapWithProxy(instance, PROXY_HANDLERS);
    }

    return instance;
  }

  getCached(name, pack) {
    return this.factory.getCached(name, pack);
  }
}

export const applyProxyWithDefaultHandlers = (target) => wrapWithProxy(target, PROXY_HANDLERS);

export const createProxyFactory = (handlers, cacheImpl) => (
  new ProxyFactory(handlers, cacheImpl)
);

export default ProxyFactory;
