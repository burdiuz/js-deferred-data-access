'use strict';

import { createRequestTargetDecorator } from './RequestTargetDecorator';
import RequestTarget from './RequestTarget';

export const FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');
export const FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');

class RequestFactory {
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
  constructor(handlers, cacheImpl = null, noInit = false) {
    if (noInit) {
      return;
    }

    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_DECORATOR_FIELD] = createRequestTargetDecorator(this, handlers);

    Object.defineProperties(this, {
      cache: {
        value: cacheImpl || null
      }
    });
  }

  create(promise) {
    var request = RequestTarget.create(promise, this[FACTORY_HANDLERS_FIELD]);
    if (this[FACTORY_HANDLERS_FIELD].available) {
      this[FACTORY_DECORATOR_FIELD].apply(request);
    }
    return request;
  }

  getCached(name, pack) {
    return this.cache && this.cache.get(name, pack);
  }

  createCached(promise, name, pack) {
    let request = null;
    if (this.cache) {
      request = this.create(promise);
      this.cache.set(name, pack, request);
    }
    return request;
  }

}

export const createRequestFactory = (handlers, cacheImpl) => new RequestFactory(handlers, cacheImpl);

export default RequestFactory;
