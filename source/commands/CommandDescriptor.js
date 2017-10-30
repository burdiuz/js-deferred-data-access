'use strict';

import ProxyCommands, { ProxyCommandFields } from './ProxyCommands';

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


export const createDescriptors = (handlers, target, isTemporary, resourceType, cacheable) => {
  let handler, name, field, descriptor;
  const list = ProxyCommands.list;
  const length = list.length;
  target = target || {};
  for (let index = 0; index < length; index++) {
    name = list[index];
    handler = handlers[name];
    field = ProxyCommandFields[name];
    if (handler instanceof Function) {
      descriptor = new CommandDescriptor(name, handler, field);
      descriptor.isTemporary = isTemporary;
      descriptor.resourceType = resourceType;
      descriptor.cacheable = cacheable;
      descriptor = Object.freeze(descriptor);
      if (target instanceof Array) {
        target.push(descriptor);
      } else if (target) {
        target[field] = descriptor;
      }
    }
  }
  return target;
};

export default CommandDescriptor;
