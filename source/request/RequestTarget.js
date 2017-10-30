'use strict';

import { TargetStatus, TARGET_INTERNALS } from '../core';
import { isResource } from '../resource';
import RequestTargetInternals from './RequestTargetInternals';

const PROMISE_FIELD = Symbol('request.target::promise');

const getRequestPromise = (request) => request[TARGET_INTERNALS] || request[PROMISE_FIELD];

/**
 * The object that will be available on other side
 * @class DataAccessInterface.RequestTarget
 * @param _promise {Promise}
 * @param _requestHandlers {RequestHandlers}
 */
class RequestTarget {
  constructor(promise, requestHandlers) {
    this[TARGET_INTERNALS] = new RequestTargetInternals(this, promise, requestHandlers);

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
    target.then.apply(target, args);
  }

  catch(...args) {
    const target = getRequestPromise(this);
    target.catch.apply(target, args);
  }
}

export const isActive = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].isActive() : false;
};

export const canBeDestroyed = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].canBeDestroyed() : false;
};

export const destroy = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].destroy() : null;
};

export const toJSON = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].toJSON() : null;
};

export const isPending = (value) => {
  return getStatus(value) == TargetStatus.PENDING;
};

export const isTemporary = (target) => {
  return target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].temporary;
};

export const setTemporary = (target, value) => {
  if (target && target[TARGET_INTERNALS]) {
    target[TARGET_INTERNALS].temporary = Boolean(value);
  }
};

export const getStatus = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].status : '';
};

export const getQueueLength = (target) => {
  var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
  return list ? list.length : 0;
};

export const getQueueCommands = (target) => {
  let length;
  const result = [];
  const queue = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
  if (queue) {
    length = queue.length;
    // FIXME use Array.map()
    for (let index = 0; index < length; index++) {
      result.push(queue[index][0].type);
    }
  }
  return result;
};

export const hadChildPromises = (target) => {
  return Boolean(target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].hadChildPromises);
};

export const getRawPromise = (target) => {
  return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].promise : null;
};

const getRequestChildren = (target) => (
  target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null
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

//FIXME Is it used? Why its similar to getChildrenCount()?
export const sendRequest = (target) => {
  const list = getRequestChildren(target);
  return list ? list.length : 0;
};

export const createRequestTarget = (promise, requestHandlers) => new RequestTarget(promise, requestHandlers);

export default RequestTarget;
