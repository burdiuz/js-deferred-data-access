'use strict';
/**
 * @exports DataAccessInterface.ResourcePoolRegistry
 */

/**
 * @typedef {Object} DataAccessInterface.ResourcePoolRegistry~Events
 * @property {string} RESOURCE_POOL_CREATED Event for created ResourcePool
 * @property {string} RESOURCE_POOL_REGISTERED Event for registered ResourcePool
 * @property {string} RESOURCE_POOL_REMOVED Event for removed ResourcePool
 */

/**
 * @ignore
 */
var ResourcePoolRegistry = (function() {

  /**
   * @member {DataAccessInterface.ResourcePoolRegistry~Events} DataAccessInterface.ResourcePoolRegistry.Events
   */
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
   * @extends {DataAccessInterface.ResourcePool}
   * @private
   */
  function _DefaultResourcePool() {
    ResourcePool.apply(this);
    //INFO default ResourcePool should not be destroyable;
    this.destroy = function() {
      throw new Error('Default ResourcePool cannot be destroyed.');
    };
  }

  _DefaultResourcePool.prototype = ResourcePool.prototype;

  /**
   * @class DataAccessInterface.ResourcePoolRegistry
   * @extends EventDispatcher
   * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
   * When ResourcePool is registered in ResourcePoolRegistry, it subscribes to ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
   */
  function ResourcePoolRegistry() {
    Object.defineProperty(this, POOLS_FIELD, {
      value: {}
    });
    EventDispatcher.apply(this);
    this._poolDestroyedListener = _poolDestroyedListener.bind(this);
    // every registry should keep default pool, so you can access from anywhere
    this.register(ResourcePoolRegistry.defaultResourcePool);
  }

  /**
   * Create and register ResourcePool
   * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
   */
  function _createPool() {
    var pool = ResourcePool.create();
    if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED)) {
      this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
    }
    this.register(pool);
    return pool;
  }

  /**
   * Register ResourcePool instance.
   * @param pool {DataAccessInterface.ResourcePool} ResourcePool instance to be registered
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
   * Retrieve ResourcePool instance from registry by its Id.
   * @param poolId {String} ResourcePool instance Id
   * @returns {DataAccessInterface.ResourcePool|null}
   */
  function _get(poolId) {
    return this[POOLS_FIELD][poolId] || null;
  }

  /**
   * Check if ResourcePool registered in this registry instance.
   * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
   * @returns {Boolean}
   */
  function _isRegistered(pool) {
    return this[POOLS_FIELD].hasOwnProperty(pool instanceof ResourcePool ? pool.id : String(pool));
  }

  /**
   * Remove ResourcePool from current registry instance.
   * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
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

  /**
   * Create new instance of ResourcePoolRegistry.
   * @method DataAccessInterface.ResourcePoolRegistry.create
   * @returns {DataAccessInterface.ResourcePoolRegistry}
   */
  function ResourcePoolRegistry_create() {
    return new ResourcePoolRegistry();
  }

  ResourcePoolRegistry.create = ResourcePoolRegistry_create;
  ResourcePoolRegistry.Events = ResourcePoolRegistryEvents;
  /**
   * Default ResourcePool is created immediately after class initialization and available via ResourcePoolRegistry class, as static property.
   * Its used as default ResourcePool in `DataAccessInterface` if other not supplied.
   * Default ResourcePool cannot be destroyed, destroy() method call throws Error.
   * @member {DataAccessInterface.ResourcePool} DataAccessInterface.ResourcePoolRegistry.defaultResourcePool
   */
  ResourcePoolRegistry.defaultResourcePool = new _DefaultResourcePool();

  return ResourcePoolRegistry;
})();
