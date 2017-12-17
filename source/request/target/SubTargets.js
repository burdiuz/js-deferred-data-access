import reject from '../../utils/reject';
import TargetStatus from '../../utils/TargetStatus';
import Children from './Children';
import getRawPromise from './getRawPromise';

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
      /*
        FIXME Queue not needed, we can just listen to promise resolve/reject and store data in a
        closure to pass again into send() when parent resolved.
       */
      /*
        FIXME Add intellectual destroy on temporary resource, after its resolved set
        destroying on next tick, when it comes, check for children requests, if they do
        exist, use Promise.all() on them to wait till they resolve, after that, check
        again if resource is temporary and do same again. So children may be needed after
        all(do not remove them).
       */
      this.queue.send(this.parent, this.handleSubRequest);
      this.queue = null;
    }
  }

  parentRejected(message = null) {
  }

  send(pack, child = null) {
    const { propertyName } = pack;
    const { handlers } = this.parent;
    let promise;

    // FIXME should it be hasProperty? and hasCommand to check by command name?
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
        // this should completely remove need in pre-resolve waiting queue
        return getRawPromise(this.parent)
          .catch(() => reject('This request was rejected before sending.'))
          .then(() => this.send(pack, child));
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
    const { commands, target } = this.parent;
    return commands.execute(target, pack, child);
  };
}

export default SubTargets;
