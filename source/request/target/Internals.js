import TargetStatus from '../../utils/TargetStatus';
import { createDeferred } from '../../utils/Deferred';
import TARGET_DATA from '../../utils/TARGET_DATA';
import createRequestPackage from '../../utils/createRequestPackage';
import isResource from '../../utils/isResource';
import getResourceData from '../../utils/getResourceData';
import Queue from './Queue';
import Children from './Children';
import {
  RequestCommandFields,
  RequestCommandNames,
} from '../../command//internal/RequestCommands';

class Internals {
  constructor(target, promise, handlers) {
    this.handlers = handlers;
    this.target = target;
    this.link = {};
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary = undefined;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    // FIXME combine queue and children lists into one that will manage
    // state before and after promise resolve
    this.queue = new Queue();
    this.children = new Children();
    this.promise = promise
      .then(this.handlePromiseResolve)
      .catch(this.handlePromiseReject);
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
    return value;
  };

  handlePromiseReject = (value) => {
    this.status = TargetStatus.REJECTED;
    this.rejectQueue('Target of the call was rejected and call cannot be sent.');
    return Promise.reject(value);
  };

  sendQueue() {
    this.queue.send(this.link.id, this.handleRequest);
    this.queue = null;
  }

  rejectQueue(message = null) {
    this.queue.reject(new Error(message || 'This request was rejected before sending.'));
    this.queue = null;
  }

  sendRequest(name, pack, deferred = null, child = null) {
    let promise = null;

    if (this.handlers.hasHandler(name)) {
      promise = this.applyRequest(name, pack, deferred || createDeferred(), child);
    } else {
      throw new Error(`Request handler for "${name}" is not registered.`);
    }

    if (child) {
      this.registerChild(child);
    }

    return promise;
  }

  addToQueue(name, pack, deferred = null, child = null) {
    if (!this.queue) {
      throw new Error('Request does not contain queue, probably too little too late.');
    }

    this.queue.add(name, pack, deferred, child);
  }

  applyRequest(name, pack, deferred = null, child = null) {
    let promise;

    // FIXME can deferred be null at this point?
    if (deferred) {
      promise = deferred.promise;
    }

    switch (this.status) {
      case TargetStatus.PENDING:
        this.addToQueue(name, pack, deferred, child);
        break;
      case TargetStatus.REJECTED:
        promise = Promise.reject(
          new Error('Target object was rejected and cannot be used for calls.'),
        );
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

  handleRequest = (name, pack, deferred, child) => {
    this.handlers.handle(this.target, name, pack, deferred, child);
  };

  registerChild(child) {
    return this.children.register(child);
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
