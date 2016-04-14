'use strict';
/**
 * @exports DataAccessInterface
 */
/**
 * @ignore
 */
var DataAccessInterface = (function() {

  /**
   * @class DataAccessInterface
   * @classdesc Facade of Deferred Data Access library, it holds all of public API -- objects like ResourcePool and methods to work with resources.
   * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
   * @param {boolean} [proxyEnabled=false]
   * @param {ResourcePoolRegistry} [poolRegistry]
   * @param {ResourcePool} [pool]
   * @param {ICacheImpl} [cacheImpl]
   */
  function DataAccessInterface(handlers, proxyEnabled, _poolRegistry, _pool, _cacheImpl) {
    proxyEnabled = Boolean(proxyEnabled);
    if (proxyEnabled && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }
    var _handlers = RequestHandlers.create(proxyEnabled);
    var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers, _cacheImpl);
    _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
    if (_pool) {
      _poolRegistry.register(_pool);
    } else if (_pool !== undefined) {
      _pool = _poolRegistry.createPool();
    } else {
      _pool = ResourcePoolRegistry.defaultResourcePool;
    }
    Object.defineProperties(this, {
      /**
       * @member {ResourcePoolRegistry} DataAccessInterface#poolRegistry
       * @readonly
       */
      poolRegistry: {
        value: _poolRegistry
      },
      /**
       * @member {ResourcePool} DataAccessInterface#pool
       * @readonly
       */
      pool: {
        get: function() {
          return _pool;
        }
      },
      /**
       * @member {ResourceConverter} DataAccessInterface#resourceConverter
       * @readonly
       */
      resourceConverter: {
        value: ResourceConverter.create(_factory, _poolRegistry, _pool, _handlers)
      },
      /**
       * @member {RequestFactory} DataAccessInterface#factory
       * @readonly
       */
      factory: {
        value: _factory
      },
      /**
       * @member {boolean} DataAccessInterface#proxyEnabled
       * @readonly
       */
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

  function _isOwnResource(resource) {
    /**
     * @type {boolean|undefined}
     */
    var result;
    /**
     * @type {DataAccessInterface.ResourcePool}
     */
    var pool;
    if (isResource(resource)) {
      pool = this.poolRegistry.get(getResourcePoolId(resource));
      result = pool && pool.has(getResourceId(resource));
    }
    return result;
  }

  /**
   * @method DataAccessInterface#parse
   * @param {Object|string} data
   * @returns {Object}
   */
  DataAccessInterface.prototype.parse = _parse;

  /**
   * @method DataAccessInterface#toJSON
   * @param {Object} data
   * @returns {Object}
   */
  DataAccessInterface.prototype.toJSON = _toJSON;

  /**
   * Check if resource belongs to DataAccessInterface instance.
   * @method DataAccessInterface#isOwnResource
   * @param {RAWResource|TargetResource|RequestTarget} resource
   * @returns {Object}
   */
  DataAccessInterface.prototype.isOwnResource = _isOwnResource;

  //------------------ static

  function DataAccessInterface_create(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
    return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
  }

  function DataAccessInterface_dummy(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
    var api = new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
    return api.parse(DataAccessInterface.createForeignResource());
  }

  /**
   * @method DataAccessInterface.create
   * @param {CommandDescriptor[]|Object.<string, Function|CommandDescriptor>} handlers
   * @param {boolean} [proxyEnabled=false]
   * @param {ResourcePoolRegistry} [poolRegistry]
   * @param {ResourcePool} [pool]
   * @param {ICacheImpl} [cacheImpl]
   * @returns {DataAccessInterface}
   */
  DataAccessInterface.create = DataAccessInterface_create;
  DataAccessInterface.dummy = DataAccessInterface_dummy;
  /**
   * @method DataAccessInterface.createDeferred
   * @returns {Deferred}
   */
  DataAccessInterface.createDeferred = createDeferred;
  // ---- classes
  DataAccessInterface.IConvertible = IConvertible;
  DataAccessInterface.RequestTarget = RequestTarget;
  DataAccessInterface.Deferred = Deferred;
  DataAccessInterface.CommandDescriptor = CommandDescriptor;
  DataAccessInterface.ResourcePool = ResourcePool;
  DataAccessInterface.ResourcePoolRegistry = ResourcePoolRegistry;
  DataAccessInterface.ResourceConverter = ResourceConverter;
  // ---- namespaces
  DataAccessInterface.Reserved = Reserved;
  DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
  DataAccessInterface.ProxyCommands = ProxyCommands;
  // ---- functions
  DataAccessInterface.getRAWResource = getRAWResource;
  DataAccessInterface.getResourceData = getResourceData;
  DataAccessInterface.getResourceId = getResourceId;
  DataAccessInterface.getResourcePoolId = getResourcePoolId;
  DataAccessInterface.getResourceType = getResourceType;
  DataAccessInterface.createForeignResource = createForeignResource;
  DataAccessInterface.isResource = isResource;
  DataAccessInterface.isResourceConvertible = isResourceConvertible;
  DataAccessInterface.areSameResource = areSameResource;

  return DataAccessInterface;
})();

