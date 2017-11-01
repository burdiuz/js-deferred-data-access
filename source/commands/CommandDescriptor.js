class CommandDescriptor {
  constructor(type, handler, name) {
    this.name = name !== undefined ? name : type;
    this.type = type;
    this.handler = handler;
    this.isTemporary = null;
    this.cacheable = false;
    this.virtual = false;
    this.resourceType = null;
  }

  toString() {
    return `[CommandDescriptor(name="${String(this.name)}", ` +
      `type="${String(this.type)}", virtual="${this.virtual}")]`;
  }
}

export const createCommandDescriptor = (command, handler, name) => {
  const descriptor = new CommandDescriptor(command, handler, name);
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
  (handler, target, isTemporary, resourceType, cacheable) => {
    const descriptor = new CommandDescriptor(command, handler, name);
    descriptor.isTemporary = isTemporary;
    descriptor.resourceType = resourceType;
    descriptor.cacheable = cacheable;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

export default CommandDescriptor;
