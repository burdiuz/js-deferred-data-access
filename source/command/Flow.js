import getInternals from '../request/target/getInternals';
import toJSON from '../request/target/toJSON';
import reject from '../utils/reject';
import createRequestPackage from '../utils/createRequestPackage';
import setTemporary from '../request/target/setTemporary';

class Flow {
  constructor(factory) {
    this.factory = factory;
  }

  apply(target, propertyName, command, args, isTemporaryFn, cacheable = false) {
    const internals = getInternals(target);

    // call target must be a request target
    if (internals) {
      const pack = createRequestPackage(propertyName, command, args, toJSON(target));

      if (cacheable) {
        const child = this.factory.getCached(pack);

        if (child) {
          return child;
        }
      }

      return this.makeChildReqest(target, pack, isTemporaryFn, cacheable);
    }

    return this.rejectCall();
  }

  rejectCall() {
    return this.factory.create(reject(
      'Target object is not an instance of Target, so cannot be used for calls.',
    ));
  }

  makeChildReqest(target, propertyName, pack, isTemporaryFn, cacheable = false) {
    // this wil be populated on internals.send() call and passed into target's
    // promise when it will be executed on next tick, so there are no need in deferred anymore
    let promise;
    const internals = getInternals(target);
    const child = this.factory.create(
      Promise.resolve().then(() => promise),
      propertyName,
      pack,
      cacheable,
    );

    promise = internals.send(propertyName, pack, child);
    this.checkState(promise, isTemporaryFn, target, child, pack);
    return child;
  }

  checkState(promise, isTemporaryFn, parentRequest, childRequest, pack) {
    return promise.then((data) => {
      const isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
      setTemporary(childRequest, isTemporary);
    });
  }
}

export default Flow;
