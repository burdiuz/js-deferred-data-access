var RequestHandlers = (function() {

  /**
   * @returns {boolean}
   */
  function Default_isTemporary() {
    return false;
  }

  /**
   * @constructor
   */
  function RequestHandlers() {
    var _isTemporary = Default_isTemporary;
    var _handlers = {};
    var _converter;

    Object.defineProperties(this, {
      isTemporary: {
        get: function() {
          return _isTemporary;
        },
        set: function(value) {
          _isTemporary = typeof(value) === 'function' ? value : Default_isTemporary;
        }
      }
    });

    function _setConverter(converter) {
      _converter = converter;
    }

    function _setHandlers(handlers) {
      _handlers = RequestHandlers.filterHandlers(handlers);
    }

    function _hasHandler(type) {
      return _handlers.hasOwnProperty(type);
    }

    function _getHandlers() {
      return _handlers;
    }

    function _getHandler(type) {
      return _handlers[type] || null;
    }

    function _handle(resource, pack, deferred) {
      var list = _converter ? _converter.lookupForPending(pack.value) : null;
      if (list && list.length) {
        // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
        Promise.all(list).then(function() {
          _handleImmediately(resource, pack.type, pack, deferred);
        });
      } else {
        _handleImmediately(resource, pack.type, pack, deferred);
      }
    }

    function _handleImmediately(resource, type, data, deferred) {
      var handler = _getHandler(type);
      if (typeof(handler) === 'function') {
        //INFO result should be applied to deferred.resolve() or deferred.reject()
        handler(resource, data, deferred);
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

  function RequestHandlers_filterHandlers(handlers) {
    var typeHandlers = {};
    for (var name in handlers) {
      if (handlers.hasOwnProperty(name)) {
        if (typeof(handlers[name]) === 'function') {
          if (name in CommandType) {
            throw new Error('Name "' + name + '" is reserved and cannot be used as command handler.');
          } else {
            typeHandlers[name] = handlers[name];
          }
        }
      }
    }
    return typeHandlers;
  }

  /**
   * @returns {RequestHandlers}
   */
  function RequestHandlers_create() {
    return new RequestHandlers();
  }

  RequestHandlers.filterHandlers = RequestHandlers_filterHandlers;
  RequestHandlers.create = RequestHandlers_create;

  return RequestHandlers;
})();
