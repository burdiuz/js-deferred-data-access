import getInternals from '../request/target/getInternals';
import toJSON from '../request/target/toJSON';
import reject from '../utils/reject';
import { createDeferred } from '../utils/Deferred';
import createRequestPackage from '../utils/createRequestPackage';
import setTemporary from '../request/target/setTemporary';

const createHandlerFor = (
  callbackFactory,
  propertyName,
  command,
  isTemporary,
  cacheable,
) => {
  function commandHandler(...args) {
    return callbackFactory.processCall(
      this,
      propertyName,
      command,
      args,
      isTemporary,
      cacheable,
    );
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

  processCall(target, propertyName, command, args, isTemporary, cacheable = false) {
    const internals = getInternals(target);

    // call target must be a request target
    if (internals) {
      const pack = createRequestPackage(command, propertyName, args, toJSON(target));

      if (cacheable) {
        const child = this.factory.getCached(propertyName, pack);

        if (child) {
          return child;
        }
      }

      return this.makeChildReqest(target, propertyName, pack, isTemporary, cacheable);
    }

    return this.rejectCall();
  }

  rejectCall() {
    return this.factory.create(reject(
      'Target object is not a resource, so cannot be used for calls.',
    ));
  }

  makeChildReqest(target, propertyName, pack, isTemporary, cacheable = false) {
    const internals = getInternals(target);
    const deferred = createDeferred();
    const child = this.factory.create(deferred.promise, propertyName, pack, cacheable);

    const promise = internals.send(propertyName, pack, deferred, child);

    if (promise) {
      this.checkState(promise, isTemporary, target, child, pack);
    } else {
      deferred.resolve(reject(
        'Initial request failed and didn\'t result with promise.',
      ));
    }

    return child;
  }

  checkState(promise, isTemporaryFn, parentRequest, childRequest, pack) {
    return promise.then((data) => {
      const isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
      setTemporary(childRequest, isTemporary);
    });
  }

  setFactory(factory) {
    this.factory = factory;
  }
}

export default CallbackFactory;
