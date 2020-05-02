import Descriptor from './Descriptor';
import reject from '../utils/reject';
import areProxyHandlersAvailable from './proxy/areProxyHandlersAvailable';
import hasOwnProperty from '../utils/hasOwnProperty';
import filterDescriptors from './descriptor/filterDescriptors';
import getResourceType from '../utils/getResourceType';

/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
const DEFAULT_KEY = '';


export const HandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated',
});

const executeCommand = (parentRequest, pack, resultRequest) => {
  // FIXME is it necessary to check here for instanceof?
  if (descriptor instanceof Descriptor) {
    return new Promise((resolve) => {
      resolve(descriptor.handler(parentRequest, pack, resultRequest));
    });
  }

  return reject(`Command descriptor for "${propertyName}" was not found.`);
}

/* FIXME reorganize handlers to have access to handlers by command not property name.
   virtual command must be the one with propertyName = null.
   command could be sent by command type or property name, no need in both.
   command and propertyName must be unique, both.
   CommandFactory generates handlers that end command by propertyName.
   request/target/send() sends commands by Command type
   rename request/Handlers to command/Commands, rename call() to execute()
   rename command/CallbackFactory to request/MemberFactory, Flow move too
 */
class Commands {
  constructor(proxyEnabled = false) {
    // named collection of Descriptor lists that may be applied
    this.properties = { [DEFAULT_KEY]: [] };
    this.descriptors = { [DEFAULT_KEY]: {} };
    // FIXME this.by*** should replace this.descriptors to store descriptors by command
    // and by property name for easier access
    this.byCommand = { [DEFAULT_KEY]: {} };
    this.byPropertyName = { [DEFAULT_KEY]: {} };
    this.proxyEnabled = Boolean(proxyEnabled);
    this.converter = null;
  }

  get available() {
    const nonEmptyListIndex = Object.getOwnPropertyNames(this.properties).findIndex((name) => {
      const list = this.properties[name];
      return Boolean(list && list.length);
    });
    return nonEmptyListIndex >= 0;
  }

  setConverter(converter) {
    this.converter = converter;
  }

  setCommands(handlers) {
    this.setCommandsByType(DEFAULT_KEY, handlers);

    Object.keys(handlers).forEach((name) => {
      const handler = handlers[name];
      if (handler && (handler.constructor === Object || handler instanceof Array)) {
        this.setCommandsByType(name, handler);
      }
    });

    if (this.proxyEnabled) {
      areProxyHandlersAvailable(this.descriptors[DEFAULT_KEY], true);
    }
  }

  setCommandsByType(type, handlers) {
    const descrs = {};
    const props = [];
    filterDescriptors(handlers, descrs, props);
    this.descriptors[type] = descrs;
    this.properties[type] = props;
  }

  // FIXME Not quite obvious that it checks against property name, not command name
  hasCommand(propertyName, type = DEFAULT_KEY) {
    return (
        type
        && this.descriptors[type]
        && hasOwnProperty(this.descriptors[type], propertyName)
      )
      || (
        this.descriptors[DEFAULT_KEY]
        && hasOwnProperty(this.descriptors[DEFAULT_KEY], propertyName)
      );
  }

  getPropertyCommands(type = '') {
    const list = this.properties[type || DEFAULT_KEY] || [];
    return [...list];
  }

  getPropertyNames(type = '') {
    return this.getPropertyCommands(type)
      .map((descriptor) => descriptor.propertyName);
  }

  getCommands(type = DEFAULT_KEY) {
    if (type && this.descriptors[type]) {
      return {
        ...this.descriptors[DEFAULT_KEY],
        ...this.descriptors[type],
      };
    }

    return this.descriptors[DEFAULT_KEY];
  }

  getCommand(propertyName, type = DEFAULT_KEY) {
    const descriptor = (
        this.descriptors[type]
        && this.descriptors[type][propertyName]
      )
      || (
        this.descriptors[DEFAULT_KEY]
        && this.descriptors[DEFAULT_KEY][propertyName]
      );

    return descriptor || null;
  }

  execute(parentRequest, pack, resultRequest) {
    const { propertyName } = pack;
    // FIXME should it also check for resultRequest to not appear in the list?
    const list = this.converter ? this.converter.lookupForPending(pack.args) : [];
    const descriptor = this.getCommand(propertyName, getResourceType(parentRequest));

    return Promise.all(list)
      .then(() => executeCommand(descriptor, parentRequest, pack, resultRequest));
  }


  static events = HandlersEvents;
}

export const createCommands = (proxyEnabled) => new Commands(proxyEnabled);

export default Commands;
