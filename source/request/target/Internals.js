import TargetStatus from '../../utils/TargetStatus';
import TARGET_DATA from '../../utils/TARGET_DATA';
import createRequestPackage from '../../utils/createRequestPackage';
import isResource from '../../utils/isResource';
import getResourceData from '../../utils/getResourceData';
import {
  RequestCommandFields,
  RequestCommandNames,
} from '../../command//internal/RequestCommands';
import SubTargets from "./SubTargets";

class Internals extends SubTargets {
  constructor(target, promise, handlers) {
    super();
    this.handlers = handlers;
    this.target = target;
    this.link = {};
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary = undefined;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.promise = promise
      .then(this.handlePromiseResolve)
      .catch(this.handlePromiseReject);
    this.setParent(this);
  }

  get poolId() {
    return this.link.poolId || null;
  }

  get type() {
    return this.link.type || null;
  }

  get id() {
    return this.link.id || null;
  }

  handlePromiseResolve = (value) => {
    this.status = TargetStatus.RESOLVED;
    if (isResource(value)) {
      this.link = getResourceData(value);
      /*
       INFO Sending "this" as result of resolve() handler, causes infinite
       loop of this.then(), so I've used wrapper object
      */
      // FIXME Check if Proxy wrapper will work with promise result, probably not
      value = { target: this.target };
      this.parentResolved();
      if (this.temporary) {
        this.destroy();
      }
    } else { // else { value must be passed as is }
      this.parentRejected('Target of the call is not a resource and call cannot be sent.');
    }
    return value;
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

export default Internals;
