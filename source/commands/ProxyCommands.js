import {
  createCommandDescriptor,
  descriptorGeneratorFactory,
} from './CommandDescriptor';

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

class ProxyCommandsClass {
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
      ProxyCommandNames.GET,
      ProxyCommandNames.SET,
      ProxyCommandNames.APPLY,
    ];
  }
}

const ProxyCommands = new ProxyCommandsClass();

export const createDescriptors = (
  handlers,
  target = {},
  isTemporary = undefined,
  resourceType = null,
  cacheable = true,
  virtual = false,
) => {
  const args = [isTemporary, resourceType, cacheable, virtual];
  ProxyCommands.list.forEach((name) => {
    const handler = handlers[name];
    const field = ProxyCommandFields[name];

    if (handler instanceof Function) {
      let descriptor = createCommandDescriptor(name, handler, field, ...args);
      descriptor = Object.freeze(descriptor);

      if (target instanceof Array) {
        target.push(descriptor);
      } else if (target) {
        target[field] = descriptor;
      }
    }
  });

  return target;
};

export default ProxyCommands;
