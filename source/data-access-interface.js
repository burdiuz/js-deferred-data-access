'use strict';
var DataAccessInterface = (function() {

  /**
   *
   * @param handlers
   * @param {} proxyEnabled
   * @param {ResourcePoolRegistry} [_poolRegistry]
   * @param {ResourcePool} [_pool]
   * @constructor
   */
  function DataAccessInterface(handlers, proxyEnabled, _poolRegistry, _pool) {
    if (proxyEnabled && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }
    var _handlers = RequestHandlers.create(proxyEnabled);
    var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
    _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
    if (_pool) {
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
        get: function() {
          return _pool;
        }
      },
      resourceConverter: {
        value: ResourceConverter.create(_factory, _poolRegistry, _pool, _handlers)
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

    function poolDestroyedHandler() {
      _pool.removeEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
      _pool = _poolRegistry.createPool();
      _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
    }

    _handlers.setHandlers(handlers);
    _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
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

  function DataAccessInterface_create(handlers, proxyEnabled, poolRegistry, pool) {
    return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool);
  }

  DataAccessInterface.create = DataAccessInterface_create;
  DataAccessInterface.createDeferred = createDeferred;

  DataAccessInterface.IConvertible = IConvertible;
  DataAccessInterface.RequestTarget = RequestTarget;
  DataAccessInterface.Deferred = Deferred;
  DataAccessInterface.Reserved = Reserved;
  DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
  DataAccessInterface.CommandDescriptor = CommandDescriptor;
  DataAccessInterface.ProxyCommands = ProxyCommands;
  DataAccessInterface.ResourcePool = ResourcePool;
  DataAccessInterface.ResourcePoolRegistry = ResourcePoolRegistry;
  DataAccessInterface.ResourceConverter = ResourceConverter;

  return DataAccessInterface;
})();

