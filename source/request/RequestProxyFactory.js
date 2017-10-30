'use strict';

import RequestFactory, { FACTORY_DECORATOR_FIELD, FACTORY_HANDLERS_FIELD } from './RequestFactory';
import { ProxyCommandFields } from '../commands/ProxyCommands';

const FACTORY_FIELD = Symbol('request.proxy.factory::factory');

const EXCLUSIONS = {
  /*
   INFO arguments and caller were included because they are required function properties
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments
   */
  'arguments': true,
  'caller': true,
  'prototype': true
};

const wrapWithProxy = (target, handlers) => {
  // INFO Target must be a function so I could use Proxy.call() interceptor.
  function requestTargetProxy() {
  }

  requestTargetProxy.target = target;
  return new Proxy(requestTargetProxy, handlers);
};

const proxyGet = (wrapper, name) => {
  let value;
  const target = wrapper.target;
  if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
    value = target[name];
  } else {
    // INFO Proxy should be already applied, so no need in additional wrapping
    value = target[ProxyCommandFields.get](name);
  }
  return value;
};

// INFO Proxy should be already applied, so no need in additional wrapping
const proxyApply = (wrapper, thisValue, args) => wrapper.target[ProxyCommandFields.apply](null, args);

const proxySet = (wrapper, name, value) => {
  let result;
  const { target } = wrapper;
  if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
    result = target[name] = value;
  } else {
    result = target[ProxyCommandFields.set](name, value);
  }
  return result;
};

const proxyHas = (wrapper, name) => wrapper.target.hasOwnProperty(name);

const proxyDeleteProperty = (wrapper, name) => {
  const { target } = wrapper;

  if (ProxyCommandFields.deleteProperty in target) {
    target[ProxyCommandFields.deleteProperty](name);
    return true;
  }

  return false;
};

const proxyOwnKeys = () => Object.getOwnPropertyNames(EXCLUSIONS);

const proxyEnumerate = () => Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();

const proxyGetOwnPropertyDescriptor = (wrapper, name) => {
  let descr;

  if (EXCLUSIONS.hasOwnProperty(name)) {
    descr = Object.getOwnPropertyDescriptor(wrapper, name);
  } else {
    descr = Object.getOwnPropertyDescriptor(wrapper.target, name);
  }

  return descr;
};

/**
 * Builds proper handlers hash for Proxy
 * @returns {Function}
 */
export const createProxyHandlers = (handlers = {}) => ({
  'get': proxyGet,
  'apply': proxyApply,
  'set': proxySet,
  'has': proxyHas,
  'deleteProperty': proxyDeleteProperty,
  'ownKeys': proxyOwnKeys,
  'enumerate': proxyEnumerate,
  'getOwnPropertyDescriptor': proxyGetOwnPropertyDescriptor,
  ...handlers,
});

const PROXY_HANDLERS = createProxyHandlers();

class RequestProxyFactory extends RequestFactory {
  constructor(handlers, cacheImpl) {
    super(null, null, true);

    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_FIELD] = RequestFactory.create(handlers, cacheImpl);
    this[FACTORY_FIELD][FACTORY_DECORATOR_FIELD].setFactory(this);
  }

  create(promise) {
    const instance = this[FACTORY_FIELD].create(promise);

    if (this[FACTORY_HANDLERS_FIELD].available) {
      return wrapWithProxy(instance, PROXY_HANDLERS);
    }

    return instance;
  }

  getCached(name, pack) {
    return this[FACTORY_FIELD].getCached(name, pack);
  }

  createCached(promise, name, pack) {
    const instance = this[FACTORY_FIELD].createCached(promise, name, pack);

    if (this[FACTORY_HANDLERS_FIELD].available) {
      return wrapWithProxy(instance, PROXY_HANDLERS);
    }

    return instance;
  }

}

export const applyProxyWithDefaultHandlers = (target) => {
  return wrapWithProxy(target, PROXY_HANDLERS);
};

export const createRequestProxyFactory = (handlers, cacheImpl) => {
  return new RequestProxyFactory(handlers, cacheImpl);
};
