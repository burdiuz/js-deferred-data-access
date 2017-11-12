export const DEFAULT_IS_TEMPORARY = () => false;

class Descriptor {
  constructor(type, handler, name) {
    this.name = name !== undefined ? name : type;
    this.type = type;
    this.handler = handler;
    /**
     * @type {function(): boolean}
     */
    this.isTemporary = DEFAULT_IS_TEMPORARY;
    this.cacheable = true;
    this.virtual = false;
    this.resourceType = null;
  }

  toString() {
    return `[Command Descriptor(name="${String(this.name)}", ` +
      `type="${String(this.type)}", virtual="${this.virtual}")]`;
  }
}

export const createDescriptor = (
  command,
  handler,
  name,
  isTemporary = undefined,
  resourceType = null,
  cacheable = true,
  virtual = false,
) => {
  const descriptor = new Descriptor(command, handler, name);
  descriptor.resourceType = resourceType;
  descriptor.cacheable = cacheable;
  descriptor.virtual = virtual;
  if (isTemporary) {
    descriptor.isTemporary = isTemporary;
  }
  // We can use Object.freeze(), it keeps class/constructor information
  return Object.freeze(descriptor);
};

export const addDescriptorTo = (descriptor, target) => {
  if (target instanceof Array) {
    target.push(descriptor);
  } else if (target) {
    target[descriptor.name] = descriptor;
  }
};

export const descriptorGeneratorFactory = (command, name) =>
  (
    handler,
    target,
    isTemporary = DEFAULT_IS_TEMPORARY,
    resourceType = null,
    cacheable = true,
    virtual = false,
  ) => {
    const descriptor = createDescriptor(
      command,
      handler,
      name,
      isTemporary,
      resourceType,
      cacheable,
      virtual,
    );
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

export default Descriptor;
