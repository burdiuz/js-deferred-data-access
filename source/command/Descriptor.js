import DEFAULT_IS_TEMPORARY from './descriptor/DEFAULT_IS_TEMPORARY';
import getPropertyName from './descriptor/getPropertyName';

class Descriptor {
  constructor(command, handler, propertyName = undefined) {
    // By default propertyName is undefined, which means its equal to "command" value.
    // If its NULL, then command is virtual, if Symbol, then leave as is,
    // any other value is converted to String.
    this.propertyName = getPropertyName(propertyName, command);
    this.command = command;
    this.handler = handler;
    /**
     * @type {function(): boolean}
     */
    this.isTemporary = DEFAULT_IS_TEMPORARY;
    this.cacheable = true;
    this.resourceType = null;
  }
}

export const createDescriptor = (
  command,
  handler,
  propertyName,
  isTemporary = null,
  resourceType = null,
  cacheable = true,
) => {
  const descriptor = new Descriptor(command, handler, propertyName);
  descriptor.resourceType = resourceType;
  descriptor.cacheable = cacheable;

  if (isTemporary) {
    descriptor.isTemporary = isTemporary;
  }

  // We can use Object.freeze(), it keeps class/constructor information
  return Object.freeze(descriptor);
};

export default Descriptor;
