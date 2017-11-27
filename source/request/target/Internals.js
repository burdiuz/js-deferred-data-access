import TargetStatus from '../../utils/TargetStatus';
import TARGET_DATA from '../../utils/TARGET_DATA';
import createRequestPackage from '../../utils/createRequestPackage';
import {
  RequestCommandFields,
  RequestCommandNames,
} from '../../command//internal/RequestCommands';
import SubTargets from './SubTargets';

class Internals extends SubTargets {
  constructor(target, promise, handlers) {
    super();
    this.handlers = handlers;
    this.target = target;
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.data = undefined;
    this.temporary = undefined;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.promise = promise
      .then(this.handlePromiseResolve)
      .catch(this.handlePromiseReject);
    this.setParent(this);
  }

  isResource() {
    if (typeof this.data === 'object' && this.data[TARGET_DATA]) {
      const data = this.data[TARGET_DATA];
      return Boolean(data.$poolId && data.$id);
    }

    return false;
  }

  get poolId() {
    return this.isResource() ? this.data[TARGET_DATA].$poolId : null;
  }

  get type() {
    return this.isResource() ? this.data[TARGET_DATA].$type : null;
  }

  get id() {
    return this.isResource() ? this.data[TARGET_DATA].$id : null;
  }

  handlePromiseResolve = (value) => {
    const result = { target: this.target, value };
    this.data = value;
    this.status = TargetStatus.RESOLVED;
    if (this.isResource()) {
      /*
       INFO Sending "this" as result of resolve() handler, causes infinite
       loop of this.then(), so I've used wrapper object
      */
      result.value = this.target;
    }

    this.parentResolved();

    // FIXME isTemporary() was not called yet, as solution can move destruction out
    if (this.temporary) {
      this.destroy();
    }

    return result;
  };

  handlePromiseReject = (value) => {
    this.status = TargetStatus.REJECTED;
    this.parentRejected('Target of the call was rejected and call cannot be sent.');
    return Promise.reject(value);
  };

  isActive() {
    return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
  }

  canBeDestroyed() {
    return this.status === TargetStatus.RESOLVED || this.status === TargetStatus.REJECTED;
  }

  destroy() {
    let promise = null;
    if (this.canBeDestroyed()) {
      // INFO I should not clear children list, since they are pending and requests already sent.
      if (this.status === TargetStatus.RESOLVED) {
        promise = this.send(
          RequestCommandFields.DESTROY,
          createRequestPackage(
            RequestCommandNames.DESTROY,
            [],
            this.toJSON(),
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
    return this.data;
  }
}

export default Internals;
