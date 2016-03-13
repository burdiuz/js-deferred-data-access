/**
 * Created by Oleg Galaburda on 13.03.16.
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

  function createProxy(target, handlers) {
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
      result = target.set(name, value);
    }
    return result;
  }

  function Proxy_has(wrapper, name) {
    return wrapper.target.hasOwnProperty(name);
  }

  function Proxy_deleteProperty(wrapper, name) {
    return false;
  }

  function Proxy_ownKeys(wrapper) {
    return Object.getOwnPropertyNames(EXCLUSIONS);
  }

  function Proxy_enumerate(wrapper) {
    return Object.getOwnPropertyNames(EXCLUSIONS);
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
        value = createProxy(
          target.get(name),
          handlers
        );
      }
      return value;
    }

    function Proxy_apply(wrapper, thisValue, args) {
      return createProxy(
        //INFO command is null because target is function we are calling now,
        // thisValue is being ignored for now
        wrapper.target.apply(null, args),
        handlers
      );
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

  function RequestProxyFactory(handlers) {
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_FIELD] = RequestFactory.create(handlers);
  }

  function _create(promise) {
    var instance = this[FACTORY_FIELD].create(promise);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      instance = createProxy(instance, PROXY_HANDLERS);
    }
    return instance;
  }

  RequestProxyFactory.prototype = RequestFactory.createNoInitProtoype();
  RequestProxyFactory.prototype.constructor = RequestProxyFactory;
  RequestProxyFactory.prototype.create = _create;

  //------------------- static

  function RequestProxyFactory_create(useProxies, handlers) {
    return new RequestProxyFactory(useProxies, handlers);
  }

  RequestProxyFactory.create = RequestProxyFactory_create;

  return RequestProxyFactory;
})();
