'use strict';
var DataAccessInterface = (function() {

  function DataAccessInterface(proxyEnabled, _poolRegistry, _pool) {
    if (proxyEnabled && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }
    var _handlers = RequestHandlers.create(proxyEnabled);
    var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
    _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
    if (_pool) {
      //FIXME it should listen for removed/destroyed event and create replacement pool automatically
      _poolRegistry.register(_pool);
    } else if (_pool !== undefined) {
      _pool = _poolRegistry.createPool();
    } else {
      _pool = ResourcePoolRegistry.defaultResourcePool;
    }
    Object.defineProperties(this, {
      poolRegistry: {
        value: _poolRegistry
      },
      pool: {
        value: _pool
      },
      resourceConverter: {
        value: ResourceConverter.create(_factory, _pool, _handlers)
      },
      factory: {
        value: _factory
      },
      proxyEnabled: {
        get: function() {
          return _handlers.proxyEnabled;
        }
      }
    });

    this.setHandlers = _handlers.setHandlers;
  }

  function _parse(data) {
    return this.resourceConverter.parse(data);
  }

  function _toJSON(data) {
    return this.resourceConverter.toJSON(data);
  }

  DataAccessInterface.prototype.parse = _parse;
  DataAccessInterface.prototype.toJSON = _toJSON;

  //------------------ static

  function DataAccessInterface_create(proxyEnabled) {
    return new DataAccessInterface(proxyEnabled);
  }

  DataAccessInterface.create = DataAccessInterface_create;
  DataAccessInterface.IConvertible = IConvertible;
  DataAccessInterface.RequestTarget = RequestTarget;
  DataAccessInterface.Reserved = Reserved;
  DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
  DataAccessInterface.CommandDescriptor = CommandDescriptor;
  DataAccessInterface.ProxyCommands = ProxyCommands;
  DataAccessInterface.ResourcePool = ResourcePool;
  DataAccessInterface.ResourcePoolRegistry = ResourcePoolRegistry;
  DataAccessInterface.ResourceConverter = ResourceConverter;

  return DataAccessInterface;
})();

