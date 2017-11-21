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
  new Factory(handlers, cacheImpl)
);

export default Factory;
