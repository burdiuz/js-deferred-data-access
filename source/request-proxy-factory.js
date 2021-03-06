'use strict';
/**
 * @exports RequestProxyFactory
 */

/**
 * @ignore
 */
var RequestProxyFactory = (function() {

  var FACTORY_FIELD = Symbol('request.proxy.factory::factory');

  var EXCLUSIONS = {
    /*
     INFO arguments and caller were included because they are required function properties
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments
     */
    'arguments': true,
    'caller': true,
    'prototype': true
  };

  function applyProxy(target, handlers) {
    function RequestTargetProxy() {
    }

    RequestTargetProxy.target = target;
    return new Proxy(RequestTargetProxy, handlers);
  }

  function Proxy_set(wrapper, name, value) {
    var result;
    var target = wrapper.target;
    if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
      result = target[name] = value;
    } else {
      result = target[ProxyCommands.fields.set](name, value);
    }
    return result;
  }

  function Proxy_has(wrapper, name) {
    return wrapper.target.hasOwnProperty(name);
  }

  function Proxy_deleteProperty(wrapper, name) {
    var result = false;
    var target = wrapper.target;
    if (ProxyCommands.fields.deleteProperty in target) {
      target[ProxyCommands.fields.deleteProperty](name);
      result = true;
    }
    return result;
  }

  function Proxy_ownKeys() {
    return Object.getOwnPropertyNames(EXCLUSIONS);
  }

  function Proxy_enumerate() {
    return Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();
  }

  function Proxy_getOwnPropertyDescriptor(wrapper, name) {
    var descr;
    if (EXCLUSIONS.hasOwnProperty(name)) {
      descr = Object.getOwnPropertyDescriptor(wrapper, name);
    } else {
      descr = Object.getOwnPropertyDescriptor(wrapper.target, name);
    }
    return descr;
  }

  /**
   * Builds proper handlers hash for Proxy
   * @returns {Function}
   */
  function createHandlers() {
    var handlers;

    function Proxy_get(wrapper, name) {
      var value;
      var target = wrapper.target;
      if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
        value = target[name];
      } else {
        value = target[ProxyCommands.fields.get](name);
        /* this makes double proxying, since its create()d with proxy already
        value = applyProxy(
          target[ProxyCommands.fields.get](name),
          handlers
        );
        */
      }
      return value;
    }

    function Proxy_apply(wrapper, thisValue, args) {
      return wrapper.target[ProxyCommands.fields.apply](null, args);
      /* this makes double proxying, since its create()d with proxy already
      return applyProxy(
        //INFO type is null because target is function we are calling now,
        // thisValue is being ignored for now
        wrapper.target[ProxyCommands.fields.apply](null, args),
        handlers
      );
      */
    }

    handlers = {
      'get': Proxy_get,
      'apply': Proxy_apply,
      'set': Proxy_set,
      'has': Proxy_has,
      'deleteProperty': Proxy_deleteProperty,
      'ownKeys': Proxy_ownKeys,
      'enumerate': Proxy_enumerate,
      'getOwnPropertyDescriptor': Proxy_getOwnPropertyDescriptor
    };

    return handlers;
  }

  var PROXY_HANDLERS = createHandlers();

  /**
   * @class RequestProxyFactory
   * @param handlers
   * @param cacheImpl
   * @private
   */
  function RequestProxyFactory(handlers, cacheImpl) {
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_FIELD] = RequestFactory.create(handlers, cacheImpl);
    this[FACTORY_FIELD][FACTORY_DECORATOR_FIELD].setFactory(this);
  }

  function _create(promise) {
    var instance = this[FACTORY_FIELD].create(promise);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      instance = applyProxy(instance, PROXY_HANDLERS);
    }
    return instance;
  }

  function _getCached(name, pack) {
    return this[FACTORY_FIELD].getCached(name, pack);
  }

  function _createCached(promise, name, pack) {
    var instance = this[FACTORY_FIELD].createCached(promise, name, pack);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      instance = applyProxy(instance, PROXY_HANDLERS);
    }
    return instance;
  }

  RequestProxyFactory.prototype = RequestFactory.createNoInitProtoype();
  RequestProxyFactory.prototype.constructor = RequestProxyFactory;
  RequestProxyFactory.prototype.create = _create;
  RequestProxyFactory.prototype.getCached = _getCached;
  RequestProxyFactory.prototype.createCached = _createCached;

  //------------------- static

  function RequestProxyFactory_applyProxy(target) {
    return applyProxy(target, PROXY_HANDLERS);
  }

  function RequestProxyFactory_create(handlers, cacheImpl) {
    return new RequestProxyFactory(handlers, cacheImpl);
  }

  RequestProxyFactory.create = RequestProxyFactory_create;
  RequestProxyFactory.applyProxy = RequestProxyFactory_applyProxy;

  return RequestProxyFactory;
})();
