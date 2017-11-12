import TargetStatus from '../../utils/TargetStatus';
import { createDeferred } from '../../utils/Deferred';
import TARGET_DATA from '../../utils/TARGET_DATA';
import createRequestPackage from '../../utils/createRequestPackage';
import isResource from '../../utils/isResource';
import getResourceData from '../../utils/getResourceData';
import { getRawPromise } from '../Target';
import {
  RequestCommandFields,
  RequestCommandNames,
} from '../../command//internal/RequestCommands';

class Internals {
  constructor(requestTarget, promise, requestHandlers) {
    this.requestHandlers = requestHandlers;
    this.requestTarget = requestTarget;
    this.link = {};
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary = undefined;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.queue = [];
    this.children = [];
    this.deferred = createDeferred();
    this.promise = this.deferred.promise;
    promise
      .then(this.handlePromiseResolve)
      .catch(this.handlePromiseReject);
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
      value = { target: this.requestTarget };
      this.sendQueue();
      /*
      In theory, at time of these lines executing, "temporary" property should be
      already set via _commandHandler() set from Decorator
       */
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
    let { promise } = deferred;

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
      default:
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
      // INFO I should not clear children list, since they are pending and requests already sent.
      if (this.status === TargetStatus.RESOLVED) {
        promise = this.sendRequest(
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
