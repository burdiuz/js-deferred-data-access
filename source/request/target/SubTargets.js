import reject from '../../utils/reject';
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
      this.queue.send(this.parent, this.handleSubRequest);
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

  send(pack, child = null) {
    const { propertyName } = pack;
    const { handlers } = this.parent;
    let promise;

    if (!handlers.hasCommand(propertyName)) {
      return reject(`Request handler for "${propertyName}" is not registered.`);
    }

    promise = this.handleSend(pack, child);

    if (child) {
      promise = this.register(child);
    }

    return promise;
  }

  handleSend(pack, child = null) {
    const { status } = this.parent;

    switch (status) {
      case TargetStatus.PENDING:
        if (!this.queue) {
          this.queue = createQueue();
        }

        return this.queue.add(pack, child);
      case TargetStatus.REJECTED:
        return reject('Target object was rejected and cannot be used for calls.');
      case TargetStatus.DESTROYED:
        return reject('Target object was destroyed and cannot be used for calls.');
      case TargetStatus.RESOLVED:
        return this.handleSubRequest(pack, child);
      default:
        return reject(`Target object is in unknown status "${status}".`);
    }
  }

  handleSubRequest = (pack, child) => {
    const { handlers, target } = this.parent;
    return handlers.handle(target, pack, child);
  };
}

export default SubTargets;
