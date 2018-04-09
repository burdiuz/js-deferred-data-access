import Flow from './Flow';

const createHandlerFor = (
  flow,
  propertyName,
  command,
  isTemporaryFn,
  cacheable,
) => {
  function commandHandler(...args) {
    return flow.apply(
      this,
      propertyName,
      command,
      args,
      isTemporaryFn,
      cacheable,
    );
  }

  return commandHandler;
};

class CallbackFactory {
  members = new Map();
  flow = null;

  constructor(factory = null) {
    this.setFactory(factory);
  }

  /**
   * @param {Descriptor} descriptor
   * @returns {Function}
   * @private
   */
  get(descriptor) {
    const { propertyName } = descriptor;
    if (!this.members.has(propertyName)) {
      this.members.set(
        propertyName,
        this.create(
          propertyName,
          descriptor.command,
          descriptor.isTemporary,
          descriptor.cacheable,
        ),
      );
    }

    return this.members.get(propertyName);
  }

  create(propertyName, command, isTemporaryFn, cacheable = false) {
    return createHandlerFor(this.flow, propertyName, command, isTemporaryFn, cacheable);
  }

  setFactory(factory) {
    this.flow = null;

    if (factory) {
      this.flow = new Flow(factory);
    }
  }
}

export default CallbackFactory;
