import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import isResource from '../utils/isResource';
import PROMISE_FIELD from './target/PROMISE_FIELD';
import Internals from './target/Internals';

const getRequestPromise = (request) => (request[TARGET_INTERNALS] || request[PROMISE_FIELD]);

export const getChildRequests = (target) => (target && target[TARGET_INTERNALS] || null);

/**
 * The object that will be available on other side
 * @class DataAccessInterface.RequestTarget
 * @param _promise {Promise}
 * @param _requestHandlers {Handlers}
 */
class Target {
  constructor(promise, requestHandlers) {
    this[TARGET_INTERNALS] = new Internals(this, promise, requestHandlers);

    const handlePromise = (data) => {
      if (!isResource(data)) {
        this[PROMISE_FIELD] = promise;
        delete this[TARGET_INTERNALS];
      }
    };

    promise.then(handlePromise, handlePromise);
  }

  then(...args) {
    const target = getRequestPromise(this);
    return target.then(...args);
  }

  catch(...args) {
    const target = getRequestPromise(this);
    return target.catch(...args);
  }
}

export const createRequestTarget = (promise, requestHandlers) => (
  new Target(promise, requestHandlers)
);

export default Target;
