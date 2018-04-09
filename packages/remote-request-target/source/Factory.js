import { createDecorator } from './Decorator';
import { createRequestTarget } from './Target';

export const NO_INIT = {};

class Factory {
  /*
   function DummyCacheImpl() {
   this.get = function(name, pack) {

   };
   this.set = function(name, pack, request) {

   };
   }
   */
  constructor(handlers, cacheImpl = null) {
    this.cache = cacheImpl;
    this.handlers = handlers;

    if (handlers !== NO_INIT) {
      this.decorator = createDecorator(this, handlers);
    }
  }

  create(promise, pack = null, cacheable = false) {
    const request = createRequestTarget(promise, this.handlers);
    if (this.handlers.available) {
      this.decorator.apply(request);
    }

    if (this.cache && cacheable) {
      this.cache.set(pack, request);
    }

    return request;
  }

  getCached(pack) {
    return this.cache && this.cache.get(pack);
  }
}

export const createRequestFactory = (handlers, cacheImpl) => (
  new Factory(handlers, cacheImpl)
);

export default Factory;
