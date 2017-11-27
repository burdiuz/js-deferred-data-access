import { createDeferred } from '../../utils/Deferred';
import TargetStatus from '../../utils/TargetStatus';
import { createQueue } from './Queue';
import Children from './Children';

class SubTargets extends Children {
  constructor(parent = null, children = []) {
    super(children);
    this.queue = null;
    this.setParent(parent);
  }

  setParent(parent) {
    this.parent = parent;
  }

  parentResolved() {
    if (this.hasQueue()) {
      this.queue.send(this.parent.id, this.handleSubRequest);
      this.queue = null;
    }
  }

  parentRejected(message = null) {
    this.queue.reject(new Error(message || 'This request was rejected before sending.'));
    this.queue = null;
  }

  hasQueue() {
    return Boolean(this.queue && this.queue.length);
  }

  send(propertyName, pack, deferred = null, child = null) {
    const { handlers } = this.parent;
    let promise;

    if (!handlers.hasCommand(propertyName)) {
      return Promise.reject(new Error(`Request handler for "${propertyName}" is not registered.`));
    }

    promise = this.handleSend(propertyName, pack, deferred || createDeferred(), child);

    if (child) {
      promise = this.register(child);
    }

    return promise;
  }

  handleSend(propertyName, pack, deferred, child = null) {
    const { status } = this.parent;

    switch (status) {
      case TargetStatus.PENDING:
        if (!this.queue) {
          this.queue = createQueue();
        }

        return this.queue.add(propertyName, pack, deferred, child);
      case TargetStatus.REJECTED:
        return Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
      case TargetStatus.DESTROYED:
        return Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
      case TargetStatus.RESOLVED:
        this.handleSubRequest(propertyName, pack, deferred, child);
        return deferred.promise;
      default:
        return Promise.reject(new Error(`Target object is in unknown status "${status}".`));
    }
  }

  handleSubRequest = (propertyName, pack, deferred, child) => {
    const { handlers, target } = this.parent;
    return handlers.handle(target, propertyName, pack, deferred, child);
  };
}

export default SubTargets;
