'use strict';

import { CommandDescriptor, ProxyCommands, ProxyCommandFields } from '../commands';

/**
 * Key for default type for handlers that will be applied to any resource that does not have type-specific handlers registered
 * @type {string}
 */
const DEFAULT_KEY = '';

export const areProxyHandlersAvailable = (handlers, throwError) => {
  let result = true;
  const list = ProxyCommands.required;
  const length = list.length;
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
  HANDLERS_UPDATED: 'handlersUpdated'
});

class RequestHandlers {

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  constructor(proxyEnabled) {
    // named collection of CommandDescriptor lists that may be applied
    this.properties = {};
    this.descriptors = {};
    this.converter;
    proxyEnabled = Boolean(proxyEnabled);

    Object.defineProperties(this, {
      /**
       * @member {Boolean} RequestHandlers#proxyEnabled
       */
      proxyEnabled: {
        value: proxyEnabled
      },
      /**
       * @member {Boolean} RequestHandlers#available
       */
      : {
      }
    });
  }

  get available() {
    return Boolean(keys.length);
  }

  setConverter(converter) {
    this.converter = converter;
  }

  /**
   * @method RequestHandlers#setHandlers
   * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
   */
  setHandlers(handlers) {
    this.setHandlersByType(DEFAULT_KEY, handlers);

    for (let name in handlers) {
      const type = handlers[name];
      if (type && type.constructor === Object || type instanceof Array) {
        this.setHandlersByType(name, type);
      }
    }

    if (proxyEnabled) {
      areProxyHandlersAvailable(this.descriptors, true);
    }
  }

  setHandlersByType(type, handlers) {
    var descrs = {};
    var props = [];
    RequestHandlers.filterHandlers(handlers, descrs, props);
    _descriptors[type] = descrs;
    _properties[type] = props;
  }

  /**
   * @method RequestHandlers#hasHandler
   * @param {String|Symbol} name Property name of CommandDescriptor
   * @param {String} [type] Resource type for type-specific handlers
   * @returns {boolean}
   */
  hasHandler(name, type) {
    return (_descriptors[type] && _descriptors[type].hasOwnProperty(name)) ||
      (_descriptors[DEFAULT_KEY] && _descriptors[DEFAULT_KEY].hasOwnProperty(name));
  }

  /**
   * IMPORTANT: Returns original list of CommandDescriptors, changing it may cause unexpected result with newly decorated resources.
   * @method RequestHandlers#getHandlers
   * @param {String} [type]
   * @returns {CommandDescriptor[]|null}
   * @private
   */
  getHandlers(type) {
    let descrs = this.descriptors[type || DEFAULT_KEY];
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
      // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
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
      //INFO result should be applied to deferred.resolve() or deferred.reject()
      handler.handler(parentRequest, data, deferred, resultRequest);
    } else {
      throw new Error('Command descriptor for "' + name + '" was not found.');
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
