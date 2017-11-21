export const DEFAULT_IS_TEMPORARY = () => true;

class Descriptor {
  constructor(type, handler, name = undefined) {
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
}

export const createDescriptor = (
  type,
  handler,
  name,
  isTemporary = DEFAULT_IS_TEMPORARY,
  resourceType = null,
  cacheable = true,
  virtual = false,
) => {
  const descriptor = new Descriptor(type, handler, name);
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

export const descriptorGeneratorFactory = (type, name) =>
  (
    handler,
    target,
    isTemporary = DEFAULT_IS_TEMPORARY,
    resourceType = null,
    cacheable = true,
    virtual = false,
  ) => {
    const descriptor = createDescriptor(
      type,
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
