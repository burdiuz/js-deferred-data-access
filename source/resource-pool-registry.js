/**
 * Global registry per environment
 */
var ResourcePoolRegistry = (function() {

  var ResourcePoolRegistryEvents = Object.freeze({
    RESOURCE_POOL_CREATED: 'resourcePoolCreated',
    RESOURCE_POOL_REGISTERED: 'resourcePoolRegistered',
    RESOURCE_POOL_REMOVED: 'resourcePoolRemoved'
  });

  var POOLS_FIELD = Symbol('resource.pool.registry::pools');

  function _poolDestroyedListener(event) {
    this.remove(event.data);
  }

  /**
   * @constructor
   */
  function ResourcePoolRegistry() {
    Object.defineProperty(this, POOLS_FIELD, {
      value: {}
    });
    EventDispatcher.apply(this);
    this._poolDestroyedListener = _poolDestroyedListener.bind(this);
  }

  /**
   *
   * @returns {ResourcePool}
   */
  function _createPool() {
    var pool = ResourcePool.create(this);
    if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED)) {
      this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
    }
    this.register(pool);
    return pool;
  }

  /**
   *
   * @param pool {ResourcePool}
   */
  function _register(pool) {
    if (this[POOLS_FIELD].hasOwnProperty(pool.id)) return;
    this[POOLS_FIELD][pool.id] = pool;
    pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, this._poolDestroyedListener);
    if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED)) {
      this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED, pool);
    }
  }

  /**
   *
   * @param poolId {String}
   * @returns {ResourcePool|null}
   */
  function _get(poolId) {
    return this[POOLS_FIELD][poolId] || null;
  }

  /**
   *
   * @param pool {ResourcePool|String}
   * @returns {Boolean}
   */
  function _isRegistered(pool) {
    return this[POOLS_FIELD].hasOwnProperty(pool instanceof ResourcePool ? pool.id : String(pool));
  }

  /**
   *
   * @param pool {ResourcePool|String}
   * @returns {Boolean}
   */
  function _remove(pool) {
    var result = false;
    pool = pool instanceof ResourcePool ? pool : this.get(pool);
    if (pool) {
      pool.removeEventListener(ResourcePool.Events.POOL_DESTROYED, this._poolDestroyedListener);
      result = delete this[POOLS_FIELD][pool.id];
    }
    if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
      this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
    }
    return result;
  }

  ResourcePoolRegistry.prototype = EventDispatcher.createNoInitPrototype();
  ResourcePoolRegistry.prototype.constructor = ResourcePoolRegistry;
  ResourcePoolRegistry.prototype.createPool = _createPool;
  ResourcePoolRegistry.prototype.register = _register;
  ResourcePoolRegistry.prototype.get = _get;
  ResourcePoolRegistry.prototype.isRegistered = _isRegistered;
  ResourcePoolRegistry.prototype.remove = _remove;

  //--------------- static


  function ResourcePoolRegistry_create() {
    return new ResourcePoolRegistry();
  }

  ResourcePoolRegistry.create = ResourcePoolRegistry_create;
  ResourcePoolRegistry.Events = ResourcePoolRegistryEvents;

  return ResourcePoolRegistry;
})();
