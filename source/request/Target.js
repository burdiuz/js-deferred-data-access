import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import TargetStatus from '../utils/TargetStatus';
import isResource from '../utils/isResource';
import Internals from './target/Internals';

const PROMISE_FIELD = Symbol('request.target::promise');

const getRequestPromise = (request) => (request[TARGET_INTERNALS] || request[PROMISE_FIELD]);

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

export const isActive = (target) => (
  target
  && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].isActive() : false
);

export const canBeDestroyed = (target) => (
  target
  && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].canBeDestroyed() : false
);

export const destroy = (target) => (
  target &&
  target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].destroy() : null
);

export const toJSON = (target) => (
  target
  && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].toJSON() : null
);

export const isTemporary = (target) => (
  target
  && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].temporary
);

export const setTemporary = (target, value) => {
  if (target && target[TARGET_INTERNALS]) {
    target[TARGET_INTERNALS].temporary = Boolean(value);
  }
};

export const getStatus = (target) => (
  target &&
  target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].status : null
);

export const isPending = (value) => (
  getStatus(value) === TargetStatus.PENDING
);

export const getQueueLength = (target) => {
  const list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
  return list ? list.length : 0;
};

export const getQueueCommands = (target) => {
  const queue = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
  if (queue) {
    return queue.map(([name]) => name);
    // return queue.map(([name, pack]) => pack.type);
  }
  return [];
};

export const hadChildPromises = (target) => Boolean(target
  && target[TARGET_INTERNALS]
  && target[TARGET_INTERNALS].hadChildPromises);

export const getRawPromise = (target) => (
  target
  && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].promise : null
);

const getRequestChildren = (target) => (
  target
  && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null
);

export const getChildren = (target) => {
  const list = getRequestChildren(target);
  return list ? [...list] : [];
};

export const getLastChild = (target) => {
  const list = getRequestChildren(target);
  return list && list.length ? list[list.length - 1] : null;
};

export const getChildrenCount = (target) => {
  const list = getRequestChildren(target);
  return list ? list.length : 0;
};

// FIXME Is it used? Why its similar to getChildrenCount()?
export const sendRequest = (target) => {
  const list = getRequestChildren(target);
  return list ? list.length : 0;
};

export const createRequestTarget = (promise, requestHandlers) => (
  new Target(promise, requestHandlers)
);

export default Target;
