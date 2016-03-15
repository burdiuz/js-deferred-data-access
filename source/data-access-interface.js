var DataAccessInterface = (function() {

  function DataAccessInterface(proxyEnabled) {
    if (proxyEnabled && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }
    var _handlers = RequestHandlers.create(proxyEnabled);
    var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
    var _poolRegistry = ResourcePoolRegistry.create();
    var _pool = ResourcePoolRegistry.defaultResourcePool;
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
        value: proxyEnabled
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
  DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
  DataAccessInterface.ProxyCommands = ProxyCommands;
  DataAccessInterface.TargetPoolEvents = ResourcePool.Events;
  DataAccessInterface.ResourceConverterEvents = ResourceConverter.Events;

  return DataAccessInterface;
})();

