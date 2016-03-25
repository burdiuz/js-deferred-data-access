'use strict';
var FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');

var FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');

var RequestFactory = (function() {
  var NOINIT = {};

  function RequestFactory(handlers) {
    if (handlers === NOINIT) {
      return;
    }
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_DECORATOR_FIELD] = RequestTargetDecorator.create(this, handlers);
  }

  function _create(promise) {
    var request = RequestTarget.create(promise, this[FACTORY_HANDLERS_FIELD]);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      this[FACTORY_DECORATOR_FIELD].apply(request);
    }
    return request;
  }

  RequestFactory.prototype.create = _create;

  //------------------- static

  function RequestFactory_create(handlers) {
    return new RequestFactory(handlers);
  }

  function RequestFactory_createNoInitPrototype() {
    return new RequestFactory(NOINIT);
  }

  RequestFactory.create = RequestFactory_create;

  RequestFactory.createNoInitProtoype = RequestFactory_createNoInitPrototype;

  return RequestFactory;
})();
