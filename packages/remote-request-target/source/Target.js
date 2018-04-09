import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import Internals from './target/Internals';

/**
 * The object that will be available on other side
 * @class DataAccessInterface.RequestTarget
 * @param _promise {Promise}
 * @param _requestHandlers {Handlers}
 */
class Target {
  constructor(promise, requestHandlers) {
    this[TARGET_INTERNALS] = new Internals(this, promise, requestHandlers);
  }

  then(...args) {
    return this[TARGET_INTERNALS].then(...args);
  }

  catch(...args) {
    return this[TARGET_INTERNALS].catch(...args);
  }
}

export const createRequestTarget = (promise, requestHandlers) => (
  new Target(promise, requestHandlers)
);

export default Target;
