var DataAccessInterface = (function() {

  function DataAccessInterface() {
    var _handlers = RequestHandlers.create();
    var _factory = RequestFactory.create(_handlers);
    Object.defineProperties(this, {
      poolRegistry: {
        value: TargetPoolRegistry
      },
      pool: {
        value: TargetPoolRegistry.createPool()
      },
      resourceConverter: {
        value: ResourceConverter.create(_factory, _handlers)
      },
      factory: {
        value: _factory
      },
      IConvertible: {
        value: IConvertible
      },
      RequestTarget: {
        value: RequestTarget
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

  function DataAccessInterface_create(useProxies) {
    var instance;
    if (useProxies && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }
    if (useProxies) {
      //FIXME continue...
      instance
    } else {
      new DataAccessInterface();
    }
  }

  DataAccessInterface.create = DataAccessInterface_create;

  return DataAccessInterface;
})();

