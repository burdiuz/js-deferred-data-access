import { createDeferred } from '../../../../shared-utils/Deferred';
import toJSON from './toJSON';

class Queue {
  constructor(list = []) {
    this.list = list;
  }

  add(pack, child) {
    const deferred = createDeferred();
    this.list.push({
      pack,
      deferred,
      child,
    });

    return deferred.promise;
  }

  get length() {
    return this.list.length;
  }

  getList() {
    return [...this.list];
  }

  getCommands() {
    // return this.list.map(([name, pack]) => pack.type);
    return this.list.map(({ pack: { propertyName } }) => propertyName);
  }

  send(target, callback) {
    // target reset is needed because, when request was made, target probably was in
    // pending mode and may be didn't have proper data
    const targetJSON = toJSON(target);
    this.list.forEach(({
      pack,
      deferred,
      child,
    }) => {
      pack.target = targetJSON;
      deferred.resolve(callback(pack, child));
    });
    this.list = [];
  }

  reject(error) {
    if (!error) {
      error = new Error('This request was rejected before sending.');
    }
    this.list.forEach(({ deferred }) => deferred.reject(error));
    this.list = [];
  }
}

export const createQueue = (list = []) => new Queue(list);

export default Queue;
