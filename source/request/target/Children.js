import getRawPromise from './getRawPromise';

class Children {
  constructor(list = []) {
    this.list = list;
  }

  register(child) {
    const handler = () => {
      const index = this.list.indexOf(child);
      if (index >= 0) {
        this.list.splice(index, 1);
      }
    };

    this.list.push(child);
    // getRawPromise() is needed to capture promise resolution directly,
    // otherwise this .then() call will be counted in child.hadChildPromises.
    return getRawPromise(child).then(handler, handler);
  }

  get length() {
    return this.list.length;
  }

  getList() {
    return [...this.list];
  }

  contains(item) {
    return this.list.indexOf(item) >= 0;
  }

  get lastItem() {
    const { length } = this.list;
    return length ? this.list[length - 1] : null;
  };
}

export default Children;
