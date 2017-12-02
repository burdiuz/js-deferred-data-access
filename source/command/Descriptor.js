import isResource from '../utils/isResource';

// It will make all resources temporary and user must explicitly set resource permanent
export const DEFAULT_IS_TEMPORARY = (parent, child) => isResource(child);

class Descriptor {
  // FIXME type > command; name > propertyName
  constructor(command, handler, propertyName = undefined) {
    this.propertyName = propertyName !== undefined ? propertyName : command;
    this.command = command;
    this.handler = handler;
    /**
     * @type {function(): boolean}
     */
    this.isTemporary = DEFAULT_IS_TEMPORARY;
    this.cacheable = true;
    // FIXME no need to pass virtual, check for propertyName is null -- its virtual then
    this.virtual = false;
    this.resourceType = null;
  }
}

export const createDescriptor = (
  command,
  handler,
  propertyName,
  isTemporary = DEFAULT_IS_TEMPORARY,
  resourceType = null,
  cacheable = true,
  virtual = false,
) => {
  const descriptor = new Descriptor(command, handler, propertyName);
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
    target[descriptor.propertyName] = descriptor;
  }
};

export const descriptorGeneratorFactory = (command, propertyName) =>
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
      propertyName,
      isTemporary,
      resourceType,
      cacheable,
      virtual,
    );
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

export default Descriptor;
