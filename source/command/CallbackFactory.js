import getInternals from '../request/target/getInternals';
import toJSON from '../request/target/toJSON';
import { createDeferred } from '../utils/Deferred';
import createRequestPackage from '../utils/createRequestPackage';
import setTemporary from '../request/target/setTemporary';

const createHandlerFor = (
  factoryWrapper,
  propertyName,
  command,
  isTemporary,
  cacheable,
) => {
  const { factory, checkState, getChildRequest } = factoryWrapper;

  function commandHandler(...args) {
    const target = getInternals(this);
    let child;
    let promise;
    // call target must be a request target
    if (target) {
      const pack = createRequestPackage(command, propertyName, args, toJSON(this));
      const request = getChildRequest(propertyName, pack, cacheable);
      child = request.child;
      if (request.deferred) {
        promise = target.send(propertyName, pack, request.deferred, child);
        if (promise) {
          checkState(promise, isTemporary, this, child, pack);
        } else {
          child = null;
          promise = Promise.reject(new Error('Initial request failed and didn\'t result with promise.'));
        }
      }
    } else {
      promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
    }
    return child || factory.create(promise);
  }

  return commandHandler;
};

class CallbackFactory {
  members = new Map();
  factory = null;

  constructor(factory = null) {
    this.setFactory(factory);
  }

  /**
   * @param {Descriptor} descriptor
   * @returns {Function}
   * @private
   */
  get(descriptor) {
    const { propertyName } = descriptor;
    if (!this.members.has(propertyName)) {
      this.members.set(
        propertyName,
        this.create(
          propertyName,
          descriptor.command,
          descriptor.isTemporary,
          descriptor.cacheable,
        ),
      );
    }
    return this.members.get(propertyName);
  }

  create(propertyName, command, isTemporary, cacheable = false) {
    return createHandlerFor(this, propertyName, command, isTemporary, cacheable);
  }

  getChildRequest = (propertyName, pack, cacheable = false) => {
    let child;
    let deferred;

    if (cacheable) {
      child = this.factory.getCached(propertyName, pack);
    }

    if (!child) {
      deferred = createDeferred();
      child = this.factory.create(deferred.promise, propertyName, pack, cacheable);
    }

    return { child, deferred };
  };

  checkState = (promise, isTemporaryFn, parentRequest, childRequest, pack) => {
    promise.then((data) => {
      const isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
      setTemporary(childRequest, isTemporary);
    });
  };

  setFactory(factory) {
    this.factory = factory;
  }
}

export default CallbackFactory;
