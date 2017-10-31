import { createRequestTargetDecorator } from './RequestTargetDecorator';
import { createRequestTarget } from './RequestTarget';

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
  constructor(handlers, cacheImpl = null, noInit = false) {
    if (noInit) {
      return;
    }

    this.cache = cacheImpl;
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_DECORATOR_FIELD] = createRequestTargetDecorator(this, handlers);
  }

  create(promise) {
    const request = createRequestTarget(promise, this[FACTORY_HANDLERS_FIELD]);
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

export const createRequestFactory = (handlers, cacheImpl) => (
  new RequestFactory(handlers, cacheImpl)
);

export default RequestFactory;
