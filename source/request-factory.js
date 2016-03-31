'use strict';
/**
 * @export RequestFactory
 */

var FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');

var FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');

/**
 * @ignore
 */
var RequestFactory = (function() {
  var NOINIT = {};
  /*
   function DummyCacheImpl() {
   this.get = function(name, pack) {

   };
   this.set = function(name, pack, request) {

   };
   }
   */
  /**
   * @class RequestFactory
   * @param handlers
   * @param {ICacheImpl} _cacheImpl
   * @private
   */
  function RequestFactory(handlers, _cacheImpl) {
    if (handlers === NOINIT) {
      return;
    }
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_DECORATOR_FIELD] = RequestTargetDecorator.create(this, handlers);

    Object.defineProperties(this, {
      cache: {
        value: _cacheImpl || null
      }
    });
  }

  function _create(promise) {
    var request = RequestTarget.create(promise, this[FACTORY_HANDLERS_FIELD]);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      this[FACTORY_DECORATOR_FIELD].apply(request);
    }
    return request;
  }

  function _getCached(name, pack) {
    return this.cache && this.cache.get(name, pack);
  }

  function _createCached(promise, name, pack) {
    var request = null;
    if(this.cache){
      request = this.create(promise);
      this.cache.set(name, pack, request);
    }
    return request;
  }

  RequestFactory.prototype.create = _create;
  RequestFactory.prototype.getCached = _getCached;
  RequestFactory.prototype.createCached = _createCached;

  //------------------- static

  function RequestFactory_create(handlers, cacheImpl) {
    return new RequestFactory(handlers, cacheImpl);
  }

  function RequestFactory_createNoInitPrototype() {
    return new RequestFactory(NOINIT);
  }

  RequestFactory.create = RequestFactory_create;

  RequestFactory.createNoInitProtoype = RequestFactory_createNoInitPrototype;

  return RequestFactory;
})();
