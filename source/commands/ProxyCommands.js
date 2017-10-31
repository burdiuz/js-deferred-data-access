import { descriptorGeneratorFactory } from './CommandDescriptor';

export const ProxyCommandNames = Object.freeze({
  GET: 'get',
  SET: 'set',
  APPLY: 'apply',
  DELETE_PROPERTY: 'deleteProperty',
});

export const ProxyCommandFields = Object.freeze({
  get: Symbol('proxy.commands::get'),
  set: Symbol('proxy.commands::set'),
  apply: Symbol('proxy.commands::apply'),
  deleteProperty: Symbol('proxy.commands::deleteProperty'),
});

class ProxyCommands {
  createGETDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.GET,
    ProxyCommandFields.get,
  );
  createSETDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.SET,
    ProxyCommandFields.set,
  );
  createAPPLYDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.APPLY,
    ProxyCommandFields.apply,
  );

  constructor() {
    Object.freeze(this);
  }

  get list() {
    return [
      ProxyCommandNames.GET,
      ProxyCommandNames.SET,
      ProxyCommandNames.APPLY,
      ProxyCommandNames.DELETE_PROPERTY,
    ];
  }

  get required() {
    return [
      ProxyCommandFields.GET,
      ProxyCommandFields.SET,
      ProxyCommandFields.APPLY,
    ];
  }
}

export const createDescriptors = (handlers, target, isTemporary, resourceType, cacheable) => {
  const { list } = ProxyCommands;
  const { length } = list;
  target = target || {};
  for (let index = 0; index < length; index++) {
    const name = list[index];
    const handler = handlers[name];
    const field = ProxyCommandFields[name];

    if (handler instanceof Function) {
      let descriptor = new CommandDescriptor(name, handler, field);
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

export default new ProxyCommands();
