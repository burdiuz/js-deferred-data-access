import CommandDescriptor from '../commands/CommandDescriptor';
import ProxyCommands, { ProxyCommandFields } from '../commands/ProxyCommands';
import filterRequestHandlers from '../utils/filterRequestHandlers';
import getResourceType from '../utils/getResourceType';

/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
const DEFAULT_KEY = '';

export const areProxyHandlersAvailable = (handlers, throwError) => {
  let result = true;
  const list = ProxyCommands.required;
  const { length } = list;
  for (let index = 0; index < length; index++) {
    const name = list[index];
    if (!(ProxyCommandFields[name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error(`For Proxy interface, handler "${name}" should be set.`);
      }
    }
  }
  return result;
};

export const RequestHandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated',
});

class RequestHandlers {

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  constructor(proxyEnabled = false) {
    // named collection of CommandDescriptor lists that may be applied
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
    filterRequestHandlers(handlers, descrs, props);
    this.descriptors[type] = descrs;
    this.properties[type] = props;
  }

  /**
   * @method RequestHandlers#hasHandler
   * @param {String|Symbol} name Property name of CommandDescriptor
   * @param {String} [type] Resource type for type-specific handlers
   * @returns {boolean}
   */
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
    let descrs = this.descriptors[type];
    if (!descrs) {
      descrs = this.descriptors[DEFAULT_KEY];
    }

    return descrs || null;
  }

  /**
   * @method RequestHandlers#getHandler
   * @param name
   * @param {String} [type]
   * @returns {*|null}
   * @private
   */
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

  /**
   * @method RequestHandlers#handle
   * @param {DataAccessInterface.RequestTarget} parentRequest
   * @param {String|Symbol} name
   * @param {CommandDataPack} pack
   * @param {DataAccessInterface.Deferred} deferred
   * @param {DataAccessInterface.RequestTarget} [resultRequest]
   * @private
   */
  handle(parentRequest, name, pack, deferred, resultRequest) {
    const list = this.converter ? this.converter.lookupForPending(pack.value) : null;
    if (list && list.length) {
      // FIXME Need to test on all platforms: In other browsers this might not work
      // because may need list of Promise objects, not RequestTargets
      Promise.all(list).then(() => {
        this.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
      });
    } else {
      this.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
    }
  }

  /**
   *
   * @param {DataAccessInterface.RequestTarget} parentRequest
   * @param {String|Symbol} name
   * @param {CommandDataPack} data
   * @param {DataAccessInterface.Deferred} deferred
   * @param {DataAccessInterface.RequestTarget} [resultRequest]
   * @private
   */
  handleImmediately(parentRequest, name, data, deferred, resultRequest) {
    /**
     * @type {DataAccessInterface.CommandDescriptor|null}
     */
    const handler = this.getHandler(name, getResourceType(parentRequest));
    if (handler instanceof CommandDescriptor) {
      // INFO result should be applied to deferred.resolve() or deferred.reject()
      handler.handler(parentRequest, data, deferred, resultRequest);
    } else {
      throw new Error(`Command descriptor for "${name}" was not found.`);
    }
  }
}

/**
 * @member RequestHandlers.create
 * @param {Boolean} proxyEnabled
 * @returns {RequestHandlers}
 */
export const createRequestHandlers = (proxyEnabled) => new RequestHandlers(proxyEnabled);

export default RequestHandlers;
