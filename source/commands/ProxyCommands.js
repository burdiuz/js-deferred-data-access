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
  createGETDescriptor = descriptorGeneratorFactory(ProxyCommandNames.GET, ProxyCommandFields.get);
  createSETDescriptor = descriptorGeneratorFactory(ProxyCommandNames.SET, ProxyCommandFields.set);
  createAPPLYDescriptor = descriptorGeneratorFactory(ProxyCommandNames.APPLY, ProxyCommandFields.apply);

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

export default new ProxyCommands();
