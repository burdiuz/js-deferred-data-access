'use strict';
/**
 * @exports RequestHandlers
 */
/**
 * @ignore
 */
var RequestHandlers = (function() {

  var RequestHandlersEvents = Object.freeze({
    HANDLERS_UPDATED: 'handlersUpdated'
  });

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  function RequestHandlers(proxyEnabled) {
    var _keys = [];
    var _propertyKeys = [];
    var _descriptors = {};
    var _converter;

    proxyEnabled = Boolean(proxyEnabled);

    Object.defineProperties(this, {
      proxyEnabled: {
        value: proxyEnabled
      },
      available: {
        get: function() {
          return Boolean(_keys.length);
        }
      }
    });

    function _setConverter(converter) {
      _converter = converter;
    }

    function _setHandlers(handlers) {
      _descriptors = {};
      RequestHandlers.filterHandlers(handlers, _descriptors);
      _keys = Object.getOwnPropertyNames(_descriptors).concat(Object.getOwnPropertySymbols(_descriptors));
      _propertyKeys = getNonVirtualNames(_descriptors, _keys);
      if (proxyEnabled) {
        RequestHandlers.areProxyHandlersAvailable(_descriptors, true);
      }
    }

    function _hasHandler(name) {
      return _descriptors.hasOwnProperty(name);
    }

    function _getHandlers() {
      return _descriptors;
    }

    function _getHandlerNames() {
      return _keys.slice();
    }

    function _getPropertyNames() {
      return _propertyKeys.slice();
    }

    function _getHandler(name) {
      return _descriptors[name] || null;
    }

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

    function _handleImmediately(parentRequest, name, data, deferred, resultRequest) {
      var handler = _getHandler(name);
      if (handler instanceof CommandDescriptor) {
        //INFO result should be applied to deferred.resolve() or deferred.reject()
        handler.handle(parentRequest, data, deferred, resultRequest);
      } else {
        throw new Error('Command descriptor for "' + name + '" was not found.');
      }

    }

    this.setConverter = _setConverter;
    /**
     * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
     */
    this.setHandlers = _setHandlers;
    this.hasHandler = _hasHandler;
    this.getHandlers = _getHandlers;
    this.getHandlerNames = _getHandlerNames;
    this.getPropertyNames = _getPropertyNames;
    this.getHandler = _getHandler;
    this.handle = _handle;
    this[Symbol.iterator] = function() {
      return new RequestHandlersIterator(this.getHandlers(), this.getPropertyNames());
    };
  }

  function RequestHandlersIterator(_data, _keys) {
    var _length = _keys.length;
    var _index = -1;

    function _next() {
      var result;
      if (++_index >= _length) {
        result = {done: true};
      } else {
        result = {value: _data[_keys[_index]], done: false};
      }
      return result;
    }

    this.next = _next;
    this[Symbol.iterator] = function() {
      return this;
    }.bind(this);
  }

  //------------------- static

  function getNonVirtualNames(descriptors, list) {
    var props = [];
    var length = list.length;
    for (var index = 0; index < length; index++) {
      var name = list[index];
      if (!descriptors[name].virtual) {
        props.push(name);
      }
    }
    return props;
  }

  var RequestHandlers_filterHandlers = (function() {
    /**
     * @param {Array} handlers
     * @param {Object} descriptors
     * @returns {void}
     */
    function filterArray(handlers, descriptors) {
      var length = handlers.length;
      for (var index = 0; index < length; index++) {
        var value = handlers[index];
        if (value instanceof CommandDescriptor) {
          applyDescriptor(value, descriptors);
        }
      }
    }

    /**
     * @param {Object} handlers
     * @param {Object} descriptors
     * @returns {void}
     */
    function filterHash(handlers, descriptors) {
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
          applyDescriptor(value, descriptors);
        }
      }
    }

    /**
     * Checks for CommandDescriptor uniqueness and reserved words usage.
     * @param {CommandDescriptor} descriptor
     * @param descriptors
     */
    function applyDescriptor(descriptor, descriptors) {
      var name = descriptor.name;
      if (name in Reserved.names) {
        throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
      }
      if (descriptors.hasOwnProperty(name) && descriptors[name] instanceof CommandDescriptor) {
        throw new Error('Field names should be unique, "' + String(name) + '" field has duplicates.');
      }
      descriptors[name] = descriptor;
    }

    /**
     *
     * @param {Array|Object} handlers
     * @param {Object<String, CommandDescriptor>} descriptors
     * @returns {void}
     */
    function RequestHandlers_filterHandlers(handlers, descriptors) {
      if (handlers instanceof Array) {
        filterArray(handlers, descriptors);
      } else {
        filterHash(handlers, descriptors);
      }
    }

    return RequestHandlers_filterHandlers;
  })();

  /**
   * @returns {RequestHandlers}
   */
  function RequestHandlers_create(proxyEnabled) {
    return new RequestHandlers(proxyEnabled);
  }

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
})
();
