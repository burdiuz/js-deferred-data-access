class Queue {
  constructor(list = []) {
    this.list = list;
  }

  add(name, pack, deferred, child) {
    this.list.push({
      name,
      pack,
      deferred,
      child,
    });
  }

  get length() {
    return this.list.length;
  }

  getCommands() {
    // return this.list.map(([name, pack]) => pack.type);
    return this.list.map(({ name }) => name);
  }

  send(id, callback) {
    this.list.forEach(({
      name,
      pack,
      deferred,
      child,
    }) => {
      pack.target = id;
      callback(name, pack, deferred, child);
    });
  }

  reject(message) {
    const error = new Error(message || 'This request was rejected before sending.');
    this.list.forEach(({ deferred }) => deferred.reject(error));
  }
}

export default Queue;
