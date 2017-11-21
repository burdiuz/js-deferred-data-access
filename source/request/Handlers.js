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
    this.properties = {};
    this.descriptors = {};
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

  setHandlers(handlers) {
    this.setHandlersByType(DEFAULT_KEY, handlers);

    Object.keys(handlers).forEach((name) => {
      const type = handlers[name];
      if (type && (type.constructor === Object || type instanceof Array)) {
        this.setHandlersByType(name, type);
      }
    });

    if (this.proxyEnabled) {
      areProxyHandlersAvailable(this.descriptors[DEFAULT_KEY], true);
    }
  }

  setHandlersByType(type, handlers) {
    const descrs = {};
    const props = [];
    filterHandlers(handlers, descrs, props);
    this.descriptors[type] = descrs;
    this.properties[type] = props;
  }

  hasHandler(name, type) {
    return (
        this.descriptors[type]
        && Object.prototype.hasOwnProperty.call(this.descriptors[type], name)
      )
      || (
        this.descriptors[DEFAULT_KEY]
        && Object.prototype.hasOwnProperty.call(this.descriptors[DEFAULT_KEY], name)
      );
  }

  getPropertyHandlers(type) {
    let list = this.properties[type];
    if (!list) {
      type = DEFAULT_KEY;
      list = this.properties[type];
    }

    return list ? [...list] : [];
  }

  getPropertyNames(type) {
    return this.getPropertyNames(type)
      .map((descriptor) => descriptor.name);
  }

  getHandlers(type) {
    if (this.descriptors[type]) {
      return {
        ...this.descriptors[type],
        ...this.descriptors[DEFAULT_KEY],
      };
    }

    return {
      ...this.descriptors[DEFAULT_KEY],
    };
  }

  getHandler(name, type) {
    const handler = (
        this.descriptors[type]
        && this.descriptors[type][name]
      )
      || (
        this.descriptors[DEFAULT_KEY]
        && this.descriptors[DEFAULT_KEY][name]
      );

    return handler || null;
  }

  handle(parentRequest, name, pack, deferred, resultRequest) {
    const list = this.converter ? this.converter.lookupForPending(pack.value) : null;
    if (list && list.length) {
      // FIXME Need to test on all platforms: In other browsers this might not work
      // because may need list of Promise objects, not Targets
      Promise.all(list).then(() => {
        this.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
      });
    } else {
      this.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
    }
  }

  handleImmediately(parentRequest, name, data, deferred, resultRequest) {
    /**
     * @type {DataAccessInterface.Descriptor|null}
     */
    const handler = this.getHandler(name, getResourceType(parentRequest));
    if (handler instanceof Descriptor) {
      // INFO result should be applied to deferred.resolve() or deferred.reject()
      handler.handler(parentRequest, data, deferred, resultRequest);
    } else {
      throw new Error(`Command descriptor for "${name}" was not found.`);
    }
  }

  static events = HandlersEvents;
}

export const createHandlers = (proxyEnabled) => new Handlers(proxyEnabled);

export default Handlers;
