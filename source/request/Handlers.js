import Descriptor from '../command/Descriptor';
import ProxyCommands, { ProxyCommandFields } from '../command/internal/ProxyCommands';
import filterHandlers from '../utils/filterRequestHandlers';
import getResourceType from '../utils/getResourceType';

/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
const DEFAULT_KEY = '';

export const areProxyHandlersAvailable = (handlers, throwError = false) => {
  let result = true;
  ProxyCommands.required.forEach((name) => {
    if (!(ProxyCommandFields[name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error(`For Proxy interface, handler "${name}" should be set.`);
      }
    }
  });

  return result;
};

export const HandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated',
});

class Handlers {
  constructor(proxyEnabled = false) {
    // named collection of Descriptor lists that may be applied
    this.properties = { [DEFAULT_KEY]: [] };
    this.descriptors = { [DEFAULT_KEY]: [] };
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
    filterHandlers(handlers, descrs, props);
    this.descriptors[type] = descrs;
    this.properties[type] = props;
  }

  hasCommand(propertyName, type = DEFAULT_KEY) {
    return (
        this.descriptors[type]
        && Object.prototype.hasOwnProperty.call(this.descriptors[type], propertyName)
      )
      || (
        this.descriptors[DEFAULT_KEY]
        && Object.prototype.hasOwnProperty.call(this.descriptors[DEFAULT_KEY], propertyName)
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

  handle(parentRequest, propertyName, pack, deferred, resultRequest) {
    // FIXME what is done here, what is the purpose of this line, what is value here?
    const list = this.converter ? this.converter.lookupForPending(pack.value) : null;
    if (list && list.length) {
      // FIXME Need to test on all platforms: might not work because may need list of
      // Promise objects, not Targets
      Promise.all(list).then(() => {
        this.handleImmediately(parentRequest, propertyName, pack, deferred, resultRequest);
      });
    } else {
      this.handleImmediately(parentRequest, propertyName, pack, deferred, resultRequest);
    }
  }

  handleImmediately(parentRequest, name, pack, deferred, resultRequest) {
    const descriptor = this.getCommand(name, getResourceType(parentRequest));
    if (descriptor instanceof Descriptor) {
      // INFO result should be applied to deferred.resolve() or deferred.reject()
      // FIXME change pack to {command, args} object
      descriptor.handler(parentRequest, pack, deferred, resultRequest);
    } else {
      throw new Error(`Command descriptor for "${name}" was not found.`);
    }
  }

  static events = HandlersEvents;
}

export const createHandlers = (proxyEnabled) => new Handlers(proxyEnabled);

export default Handlers;
