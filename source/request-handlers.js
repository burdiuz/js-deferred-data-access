'use strict';
/**
 * @exports RequestHandlers
 */
/**
 * @ignore
 */
var RequestHandlers = (function() {

  /**
   * Key for default type for handlers that will be applied to any resource that does not have type-specific handlers registered
   * @type {string}
   * @private
   */
  var DEFAULT_KEY = '';

  /**
   * @member {Object} RequestHandlers.Events
   */
  var RequestHandlersEvents = Object.freeze({
    HANDLERS_UPDATED: 'handlersUpdated'
  });

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  function RequestHandlers(proxyEnabled) {
    // named collection of CommandDescriptor lists that may be applied
    var _properties = {};
    var _descriptors = {};
    var _converter;

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
      available: {
        get: function() {
          return Boolean(_keys.length);
        }
      }
    });

    function _setConverter(converter) {
      _converter = converter;
    }

    /**
     * @method RequestHandlers#setHandlers
     * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
     */
    function _setHandlers(handlers) {
      _setHandlersByType(DEFAULT_KEY, handlers);
      for (var name in handlers) {
        var type = handlers[name];
        if (type && type.constructor === Object || type instanceof Array) {
          _setHandlersByType(name, type);
        }
      }
      if (proxyEnabled) {
        RequestHandlers.areProxyHandlersAvailable(_descriptors, true);
      }
    }

    function _setHandlersByType(type, handlers) {
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
    function _hasHandler(name, type) {
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
    function _getHandlers(type) {
      var descrs = _descriptors[type || DEFAULT_KEY];
      if (!descrs) {
        descrs = _descriptors[DEFAULT_KEY];
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
    function _getHandler(name, type) {
      var handler = (_descriptors[type] && _descriptors[type][name]) || (_descriptors[DEFAULT_KEY] && _descriptors[DEFAULT_KEY][name]);
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
    function _handle(parentRequest, name, pack, deferred, resultRequest) {
      var list = _converter ? _converter.lookupForPending(pack.value) : null;
      if (list && list.length) {
        // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
        Promise.all(list).then(function() {
          _handleImmediately(parentRequest, name, pack, deferred, resultRequest);
        });
      } else {
        _handleImmediately(parentRequest, name, pack, deferred, resultRequest);
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
    function _handleImmediately(parentRequest, name, data, deferred, resultRequest) {
      /**
       * @type {DataAccessInterface.CommandDescriptor|null}
       */
      var handler = _getHandler(name, getResourceType(parentRequest));
      if (handler instanceof CommandDescriptor) {
        //INFO result should be applied to deferred.resolve() or deferred.reject()
        handler.handler(parentRequest, data, deferred, resultRequest);
      } else {
        throw new Error('Command descriptor for "' + name + '" was not found.');
      }

    }

    this.setConverter = _setConverter;
    this.setHandlers = _setHandlers;
    this.hasHandler = _hasHandler;
    this.getHandlers = _getHandlers;
    this.getHandler = _getHandler;
    this.handle = _handle;
  }

  //------------------- static

  var RequestHandlers_filterHandlers = (function() {
    /**
     * @param {Array} handlers
     * @param {Object} descriptors
     * @private
     */
    function filterArray(handlers, descriptors, properties) {
      var length = handlers.length;
      for (var index = 0; index < length; index++) {
        var value = handlers[index];
        if (value instanceof CommandDescriptor) {
          applyDescriptor(value, descriptors, properties);
        }
      }
    }

    /**
     * @param {Object} handlers
     * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
     * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
     * @private
     */
    function filterHash(handlers, descriptors, properties) {
      if (!handlers) return;
      var keys = Object.getOwnPropertyNames(handlers).concat(Object.getOwnPropertySymbols(handlers));
      var length = keys.length;
      for (var index = 0; index < length; index++) {
        var name = keys[index];
        var value = handlers[name];
        if (typeof(value) === 'function') {
          value = CommandDescriptor.create(name, value);
        }
        if (value instanceof CommandDescriptor) {
          applyDescriptor(value, descriptors, properties);
        }
      }
    }

    /**
     * Checks for CommandDescriptor uniqueness and reserved words usage.
     * @param {DataAccessInterface.CommandDescriptor} descriptor
     * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
     * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
     * @private
     */
    function applyDescriptor(descriptor, descriptors, properties) {
      var name = descriptor.name;
      if (name in Reserved.names) {
        throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
      }
      if (descriptors.hasOwnProperty(name) && descriptors[name] instanceof CommandDescriptor) {
        throw new Error('Field names should be unique, "' + String(name) + '" field has duplicates.');
      }
      descriptors[name] = descriptor;
      if (!descriptor.virtual) {
        properties.push(descriptor);
      }
    }

    /**
     * @method RequestHandlers.filterHandlers
     * @param {Array|Object} handlers
     * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
     * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
     */
    function RequestHandlers_filterHandlers(handlers, descriptors, properties) {
      if (handlers instanceof Array) {
        filterArray(handlers, descriptors, properties);
      } else {
        filterHash(handlers, descriptors, properties);
      }
    }

    return RequestHandlers_filterHandlers;
  })();

  /**
   * @member RequestHandlers.create
   * @param {Boolean} proxyEnabled
   * @returns {RequestHandlers}
   */
  function RequestHandlers_create(proxyEnabled) {
    return new RequestHandlers(proxyEnabled);
  }

  /**
   * @method RequestHandlers.areProxyHandlersAvailable
   * @param handlers
   * @param throwError
   * @returns {boolean}
   * @constructor
   */
  function RequestHandlers_areProxyHandlersAvailable(handlers, throwError) {
    var result = true;
    var list = ProxyCommands.required;
    var length = list.length;
    for (var index = 0; index < length; index++) {
      var name = list[index];
      if (!(ProxyCommands.fields[name] in handlers)) {
        result = false;
        if (throwError) {
          throw new Error('For Proxy interface, handler "' + name + '" should be set.');
        }
      }
    }
    return result;
  }

  RequestHandlers.filterHandlers = RequestHandlers_filterHandlers;
  RequestHandlers.areProxyHandlersAvailable = RequestHandlers_areProxyHandlersAvailable;
  RequestHandlers.create = RequestHandlers_create;
  RequestHandlers.Events = RequestHandlersEvents;
  return RequestHandlers;
})();
