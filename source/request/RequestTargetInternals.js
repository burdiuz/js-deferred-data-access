'use strict';

import { TargetStatus, createDeferred, TARGET_DATA } from '../core';
import { getRawPromise } from './RequestTarget';
import {
  RequestTargetCommandFields,
  RequestTargetCommandNames,
} from '../commands/RequestTargetCommands';

/**
 * @exports RequestTargetInternals
 */

class RequestTargetInternals {

  /**
   * @class RequestTargetInternals
   * @param {DataAccessInterface.RequestTarget} _requestTarget
   * @param {Promise} _promise
   * @param {RequestHandlers} _requestHandlers
   * @mixin Promise
   */
  constructor(requestTarget, promise, requestHandlers) {
    this.requestHandlers = requestHandlers;
    this.requestTarget = requestTarget;
    this.link = {};
    //INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.queue = [];
    this.children = [];
    this.deferred = createDeferred();
    this.promise = this.deferred.promise
      .then(
        this.handlePromiseResolve,
        this.handlePromiseReject,
      );
  }

  handlePromiseResolve = (value) => {
    this.status = TargetStatus.RESOLVED;
    if (isResource(value)) {
      this.link = getResourceData(value);
      //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
      //FIXME Check if Proxy wrapper will work with promise result, probably not
      value = { target: this.requestTarget };
      this.sendQueue();
      //In theory, at time of these lines executing, "temporary" property should be already set via _commandHandler() set from RequestTargetDecorator
      if (this.temporary) {
        this.destroy();
      }
    } else { // else { value must be passed as is }
      this.rejectQueue('Target of the call is not a resource and call cannot be sent.');
    }
    this.deferred.resolve(value);
    delete this.deferred;
  };

  handlePromiseReject = (value) => {
    this.status = TargetStatus.REJECTED;
    this.rejectQueue('Target of the call was rejected and call cannot be sent.');
    this.deferred.reject(value);
    delete this.deferred;
  };

  get poolId() {
    return this.link.poolId || null;
  }

  get type() {
    return this.link.type || null;
  }

  get id() {
    return this.link.id || null;
  }

  sendQueue() {
    while (this.queue && this.queue.length) {
      const [name, pack, deferred, child] = this.queue.shift();
      pack.target = this.link.id;
      this.handleRequest(name, pack, deferred, child);
    }
    this.queue = null;
  }

  rejectQueue(message) {
    const error = new Error(message || 'This request was rejected before sending.');
    while (this.queue && this.queue.length) {
      /**
       * @type {Array.<string, CommandDataPack, DataAccessInterface.Deferred>}
       */
        //FIXME [string, {type:string, cmd:string, value:*, target:string}, Deferred] -- how to describe this in JSDoc?
      const [, , deferred] = this.queue.shift();
      deferred.reject(error);
    }
    this.queue = null;
  }

  sendRequest(name, pack, deferred, child) {
    let promise = null;

    if (this.requestHandlers.hasHandler(name)) {
      promise = this.applyRequest(name, pack, deferred || createDeferred(), child);
    } else {
      throw new Error(`Request handler for "${name}" is not registered.`);
    }

    if (child) {
      this.registerChild(child);
    }

    return promise;
  }

  addToQueue(name, pack, deferred, child) {
    this.queue.push([name, pack, deferred, child]);
  }

  applyRequest(name, pack, deferred, child) {
    let promise = deferred.promise;

    switch (this.status) {
      case TargetStatus.PENDING:
        this.addToQueue(name, pack, deferred, child);
        break;
      case TargetStatus.REJECTED:
        promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
        break;
      case TargetStatus.DESTROYED:
        promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
        break;
      case TargetStatus.RESOLVED:
        this.handleRequest(name, pack, deferred, child);
        break;
    }

    return promise;
  }

  handleRequest(name, pack, deferred, child) {
    this.requestHandlers.handle(this.requestTarget, name, pack, deferred, child);
  }

  registerChild(childRequestTarget) {
    const handleChildRequest = () => {
      if (this.children) {
        const index = this.children.indexOf(childRequestTarget);
        if (index >= 0) {
          this.children.splice(index, 1);
        }
      }
    };

    this.children.push(childRequestTarget);
    getRawPromise(childRequestTarget)
      .then(handleChildRequest, handleChildRequest);
  }

  isActive() {
    return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
  }

  canBeDestroyed() {
    return this.status === TargetStatus.RESOLVED || this.status === TargetStatus.REJECTED;
  }

  destroy() {
    let promise = null;
    if (this.canBeDestroyed()) {
      //INFO I should not clear children list, since they are pending and requests already sent.
      if (this.status === TargetStatus.RESOLVED) {
        promise = this.sendRequest(
          RequestTargetCommandFields.DESTROY,
          createRequestPackage(
            RequestTargetCommandNames.DESTROY,
            [null, null],
            this.id,
          ),
        );
      } else {
        promise = Promise.resolve();
      }
      this.status = TargetStatus.DESTROYED;
    } else {
      promise = Promise.reject(new Error('Invalid or already destroyed target.'));
    }
    return promise;
  }

  then(handleResolve, handleReject) {
    const child = this.promise.then(handleResolve, handleReject);
    this.hadChildPromises = true;
    return child;
  }

  catch(handleReject) {
    const child = this.promise.catch(handleReject);
    this.hadChildPromises = true;
    return child;
  }

  toJSON() {
    return {
      [TARGET_DATA]: {
        id: this.link.id,
        type: this.link.type,
        poolId: this.link.poolId,
      },
    };
  }
}

export const createRequestPackage = (type, args, targetId) => {
  const result = {
    type: type,
    cmd: args[0], //cmd,
    value: args[1], //value,
    target: targetId,
  };

  // FIXME why?
  Object.defineProperty(result, 'args', {
    value: args,
  });

  return result;
};

export default RequestTargetInternals;
