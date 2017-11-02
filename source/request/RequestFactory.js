import { createRequestTargetDecorator } from './RequestTargetDecorator';
import { createRequestTarget } from './RequestTarget';

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
    this.handlers = handlers;
    this.decorator = createRequestTargetDecorator(this, handlers);
  }

  create(promise) {
    const request = createRequestTarget(promise, this.handlers);
    if (this.handlers.available) {
      this.decorator.apply(request);
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
