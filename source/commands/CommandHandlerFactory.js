'use strict';
import { TARGET_INTERNALS, TARGET_DATA } from '../core';
import { createRequestPackage } from '../request/RequestTargetInternals';

const createCommandHandlerFor = (
  factoryWrapper,
  propertyName,
  commandType,
  isTemporary,
  cacheable,
) => {
  const { factory, checkState, getChildRequest } = factoryWrapper;

  function commandHandler(command, value) {
    let result;
    let promise;
    if (this[TARGET_INTERNALS]) {
      const pack = createRequestPackage(commandType, arguments, this[TARGET_INTERNALS].id);
      // FIXME Explicitly pass scope
      const request = getChildRequest(propertyName, pack, cacheable);
      result = request.child;
      if (request.deferred) {
        promise = this[TARGET_INTERNALS].sendRequest(propertyName, pack, request.deferred, result);
        if (promise) {
          if (isTemporary) {
            //FIXME isTemporary must be called before `result` was resolved
            //FIXME remove default `isTemporary`, if not defined just skip
            checkState(promise, isTemporary, this, result, pack);
          }
        } else {
          result = null;
          promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
        }
      }
    } else {
      promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
    }
    return result || factory.create(promise);
  }

  return commandHandler;
};

class CommandHandlerFactory {
  members = new Map();
  factory = null;

  constructor(factory = null) {
    this.setFactory(factory);
  }

  /**
   * @param {CommandDescriptor} descriptor
   * @returns {Function}
   * @private
   */
  get(descriptor) {
    const propertyName = descriptor.name;
    if (!this.members.has(propertyName)) {
      this.members.set(
        propertyName,
        this.create(
          descriptor.name,
          descriptor.type,
          descriptor.isTemporary,
          descriptor.cacheable
        ),
      );
    }
    return this.members.get(propertyName);
  }

  create(propertyName, commandType, isTemporary, cacheable) {
    return createCommandHandlerFor(this, propertyName, commandType, isTemporary, cacheable);
  }

  getChildRequest = (propertyName, pack, cacheable) => {
    let child, deferred;
    if (cacheable) {
      child = this.factory.getCached(propertyName, pack);
    }
    if (!child) {
      deferred = createDeferred();
      if (cacheable) {
        child = this.factory.createCached(deferred.promise, propertyName, pack);
      } else {
        child = this.factory.create(deferred.promise, propertyName, pack);
      }
    }
    return { child: child, deferred: deferred };
  };

  checkState = (promise, isTemporaryFn, parentRequest, childRequest, pack) => {
    if (promise) {
      promise.then((data) => {
        const isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
        RequestTarget.setTemporary(childRequest, isTemporary);
      });
    }
  };

  setFactory(factory) {
    this.factory = factory;
  }
}

export default CommandHandlerFactory;
